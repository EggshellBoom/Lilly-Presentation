from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import generics, status
from rest_framework.views import APIView
from .serializer import SequenceSerializer, CreateSequenceSerializer, UpdateSequenceSerializer
from .models import Sequence
from .dna_structure import NUCLEOTIDE_BASE, DNA_Codons
from rest_framework.response import Response
from django.http import JsonResponse
import string
from Bio.Seq import Seq
from Bio.Blast import NCBIWWW
from Bio.Blast import NCBIXML
import time
import os
from Bio import pairwise2
from Bio.SeqRecord import SeqRecord
from Bio import SeqIO
from datetime import datetime
from os import path
from Bio import AlignIO
from Bio.Phylo.TreeConstruction import DistanceCalculator,DistanceTreeConstructor
from Bio import Phylo
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle
from keras.preprocessing import image
import numpy as np
import keras
import tensorflow as tf
from PIL import Image
from keras.preprocessing import image
# Create your views here.


def seq_validate(seq, seq_type):
    if not seq_type in set(["DNA", "RNA"]):
        return False
    return set(NUCLEOTIDE_BASE[seq_type]).issuperset(seq)


class SequenceView(generics.ListAPIView):
    serializer_class = SequenceSerializer

    def get_queryset(self):
        session = self.request.session.session_key
        queryset = Sequence.objects.filter(session=session)
        return queryset


class CreateSequenceView(APIView):
    serializer_class = CreateSequenceSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            seq_type = serializer.data.get('seq_type')
            seq = serializer.data.get('sequence').upper()
            if not seq_validate(seq, seq_type):
                return Response({'message': 'The sequence is invalid. Please Resubmit.'}, status=status.HTTP_400_BAD_REQUEST)

            session = self.request.session.session_key
            label = serializer.data.get('label')
            if not Sequence.objects.filter(label=label).count() == 0:
                return Response({'message': 'The input data is invalid: repeated label. Please Resubmit.'}, status=status.HTTP_400_BAD_REQUEST)

            sequence = Sequence(session=session, label=label,
                                seq_type=seq_type, sequence=seq)
            sequence.save()
            return Response(SequenceSerializer(sequence).data, status=status.HTTP_201_CREATED)
        return Response({'message': 'The input data is invalid. Please Resubmit.'}, status=status.HTTP_400_BAD_REQUEST)


class UpdateSequenceView(APIView):
    serializer_class = UpdateSequenceSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            seq_type = serializer.data.get('seq_type')
            seq = serializer.data.get('sequence').upper()
            if not seq_validate(seq, seq_type):
                return Response({'message': 'The sequence is invalid.Please Resubmit.'}, status=status.HTTP_400_BAD_REQUEST)

            session = self.request.session.session_key
            label = serializer.data.get('label')
            seq_id = serializer.data.get('seq_id')
            queryset = Sequence.objects.filter(seq_id=seq_id)
            if not queryset.exists():
                return Response({'message': 'The sequence does not exist'}, status=status.HTTP_400_BAD_REQUEST)
            sequence = queryset[0]
            sequence.session = session
            sequence.label = label
            sequence.sequence = seq
            sequence.seq_type = seq_type
            sequence.save(
                update_fields=['seq_id', 'session', 'label', 'seq_type', 'sequence'])
            return Response(SequenceSerializer(sequence).data, status=status.HTTP_200_OK)
        return Response({'message': 'The input data is invalid'}, status=status.HTTP_400_BAD_REQUEST)


class AnalyzeSequenceView(APIView):

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        ids = request.data
        if not all(isinstance(x, int) for x in ids):
            return Response({'message': 'The input lists contains illegal ids'}, status=status.HTTP_400_BAD_REQUEST)
        queryset = Sequence.objects.filter(pk__in=ids)
        response = []
        for seq in queryset:
            element = {
                "Label": None,
                "Sequence": None,
                "Length": None,
                "Biotype": None,
            }
            try:
                my_seq = Seq(seq.sequence)
                element["Label"] = seq.label
                element["Sequence"] = seq.sequence
                element["Length"] = len(my_seq)
                element["Biotype"] = seq.seq_type
                element["GC Content"] = round(
                    (my_seq.count('C') + my_seq.count('G')) / len(my_seq) * 100)
                if seq.seq_type == "DNA":
                    element["A Frequency"] = my_seq.count("A")
                    element["T Frequency"] = my_seq.count("T")
                    element["C Frequency"] = my_seq.count("C")
                    element["G Frequency"] = my_seq.count("G")
                    element["Transcribe"] = str(my_seq.transcribe())

                if seq.seq_type == "RNA":
                    element["A Frequency"] = my_seq.count("A")
                    element["U Frequency"] = my_seq.count("U")
                    element["C Frequency"] = my_seq.count("C")
                    element["G Frequency"] = my_seq.count("G")
                    element["Back Transcribe"] = str(my_seq.back_transcribe())

                element["Complement"] = str(my_seq.complement())
                element["Reverse Complement"] = str(
                    my_seq.reverse_complement())
                element["Protein Translation"] = str(my_seq.translate())

            except:
                return Response({'message': 'exception during processing'}, status=status.HTTP_400_BAD_REQUEST)
            response.append(element)
        return Response(response, status=status.HTTP_200_OK)


class BlastSequenceView(APIView):

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        ids = request.data
        if not all(isinstance(x, int) for x in ids):
            return Response({'message': 'The input lists contains illegal ids'}, status=status.HTTP_400_BAD_REQUEST)
        queryset = Sequence.objects.filter(pk__in=ids)
        # response = [
        #     {
        #         "Title": "Alignment",
        #         "Sequence": "gi|1676320234|emb|LR594564.1| Streptopelia turtur genome assembly, chromosome: 13",
        #         "Length": 20810306,
        #         "E Value": 6.10659,
        #         "query": "AAAAGGAGAGAGAGTTTATA",
        #         "match": "||||||||||||||||||||",
        #         "sbjct": "AAAAGGAGAGAGAGTTTATA"
        #     },
        #     {
        #         "Title": "Alignment",
        #         "Sequence": "gi|1395234831|gb|CP026251.1| Scophthalmus maximus chromosome 9",
        #         "Length": 25242470,
        #         "E Value": 6.10659,
        #         "query": "AAAAGGAGAGAGAGTTTATA",
        #         "match": "||||||||||||||||||||",
        #         "sbjct": "AAAAGGAGAGAGAGTTTATA"
        #     }
        # ]
        # return Response(response, status=status.HTTP_200_OK)

        response = []

        for seq in queryset:
            try:
                my_seq = Seq(seq.sequence)
                print("start", my_seq)
                result_handle = NCBIWWW.qblast("blastn", "nt", my_seq)
                print("finish", my_seq)
                blast_records = NCBIXML.parse(result_handle)
                for b in blast_records:
                    for alignment in b.alignments:
                        aln = {}
                        for hsp in alignment.hsps:
                            aln["Title"] = "Alignment"
                            aln["Sequence"] = alignment.title
                            aln["Length"] = alignment.length
                            aln["E Value"] = hsp.expect
                            aln["query"] = hsp.query
                            aln["sbjct"] = hsp.sbjct
                        response.append(aln)
            except:
                return Response({'message': 'exception during processing'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(response, status=status.HTTP_200_OK)


def format_alignment(alignment):
    return {
        "seqA": alignment.seqA,
        "seqB": alignment.seqB,
        "score": alignment.score
    }


def format_sequence(sequence):
    return {
        "sequence": str(sequence.seq),
        "label": sequence.id
    }


class AlignSequenceView(APIView):

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        ids = request.data["ids"]
        algo = request.data["algo"]
        if not all(isinstance(x, int) for x in ids):
            return Response({'message': 'The input lists contains illegal ids'}, status=status.HTTP_400_BAD_REQUEST)
        if not all(x in ["G", "L", "M"] for x in algo):
            return Response({'message': 'The algorithm is unspecified'}, status=status.HTTP_400_BAD_REQUEST)
        if algo == "G" or algo == "L":
            if len(ids) > 2:
                return Response({'message': 'pairwise alignment only takes 2 sequenceses, more given'}, status=status.HTTP_400_BAD_REQUEST)
        queryset = Sequence.objects.filter(pk__in=ids)
        response = []
        if algo == "G":
            alignments = pairwise2.align.globalmx(
                queryset[0].sequence, queryset[1].sequence, 2, -1)
            for a in alignments:
                response.append(format_alignment(a))
            return Response(response, status=status.HTTP_200_OK)
        if algo == "L":
            alignments = pairwise2.align.localmx(
                queryset[0].sequence, queryset[1].sequence, 2, -1)
            for a in alignments:
                response.append(format_alignment(a))
            return Response(response, status=status.HTTP_200_OK)
        if algo == "M":
            my_records = []
            
            for seq in queryset:
                new_id=seq.label.replace(" ", "_")
                seqR = SeqRecord(
                    Seq(seq.sequence),
                    id=new_id
                )
                my_records.append(seqR)
            filename = datetime.now().strftime("%H:%M:%S")
            SeqIO.write(my_records, f"bioFile/alignment/{filename}_in.fasta", "fasta")
            os.system(
                f"./muscle -in bioFile/alignment/{filename}_in.fasta -out bioFile/alignment/{filename}_out.fasta")
            if path.exists(f"bioFile/alignment/{filename}_out.fasta"):
                alignment = AlignIO.read(
                    f"bioFile/alignment/{filename}_out.fasta", "fasta")
                for seq in alignment:
                    response.append(format_sequence(seq))
            return Response(response, status=status.HTTP_200_OK)


class TreeSequenceView(APIView):

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        ids = request.data
        if not all(isinstance(x, int) for x in ids):
            return Response({'message': 'The input lists contains illegal ids'}, status=status.HTTP_400_BAD_REQUEST)
        queryset = Sequence.objects.filter(pk__in=ids)
        my_records = []
        response = ""
        for seq in queryset:
            new_id=seq.label.replace(" ", "_")
            seqR = SeqRecord(
                Seq(seq.sequence),
                id=new_id
            )
            my_records.append(seqR)
        filename = datetime.now().strftime("%H:%M:%S")
        SeqIO.write(my_records, f"bioFile/alignment/{filename}_in.fasta", "fasta")
        os.system(
            f"./muscle -in bioFile/alignment/{filename}_in.fasta -out bioFile/alignment/{filename}_out.fasta")
        while not path.exists(f"bioFile/alignment/{filename}_out.fasta"):
            pass
        alignment = AlignIO.read(
            f"bioFile/alignment/{filename}_out.fasta", "fasta")
        calculator = DistanceCalculator('identity')
        constructor = DistanceTreeConstructor(calculator)
        tree = constructor.build_tree(alignment)
        Phylo.write(tree, f"bioFile/tree/{filename}.tree", "newick")
        while not path.exists(f"bioFile/tree/{filename}.tree"):
            pass
        with open(f"bioFile/tree/{filename}.tree") as myfile:
            for line in myfile.readlines():
                response += line
        return Response(response, status=status.HTTP_200_OK)


class BreastCancerView(APIView):
    def post(self, request, format=None):

        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        cancer_data = request.data
        filename = "api/ML/Pickle_breast_Model.pkl"
        loaded_model = pickle.load(open(filename, 'rb'))
        sc = StandardScaler()
        cancer_data = sc.fit_transform(cancer_data)
        try:
            response = loaded_model.predict(cancer_data).tolist()
        except Exception as e:
            print(e.__str__)
            return Response({'message': e.__str__}, status=status.HTTP_400_BAD_REQUEST)

        return Response(response, status=status.HTTP_200_OK)

class SkinCancerView(APIView):
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        cancer_data = request.data
        filename = "api/ML/Skin_Model"
        model = keras.models.load_model(filename)
        image_path = "api/ML/dataset/skin/test/benign/1006.jpg"
        new_img = image.load_img(image_path, target_size=(64, 64))
        img = image.img_to_array(new_img)
        img = np.expand_dims(img, axis=0)
        prediction = model.predict(img)
        prediction = np.argmax(prediction,axis=1)
        print(prediction)
        return Response(prediction, status=status.HTTP_200_OK)