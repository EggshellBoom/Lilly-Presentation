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
            element = {}
            try:
                my_seq = Seq(seq.sequence)
                element["Label"] = seq.label
                element["Sequence"] = seq.sequence
                element["Length"] = len(my_seq)
                element["Biotype"] = seq.seq_type
                element["Complement"] = str(my_seq.complement())
                element["Reverse_Complement"] = str(
                    my_seq.reverse_complement())
                element["Protein_Translation"] = str(my_seq.translate())
                element["GC_Content"] = round(
                    (my_seq.count('C') + my_seq.count('G')) / len(my_seq) * 100)

                if seq.seq_type == "DNA":
                    element["Transcribe"] = str(my_seq.transcribe())
                    element["A_Frequency"] = my_seq.count("A")
                    element["T_Frequency"] = my_seq.count("T")
                    element["C_Frequency"] = my_seq.count("C")
                    element["G_Frequency"] = my_seq.count("G")

                if seq.seq_type == "RNA":
                    element["Back_Transcribe"] = str(my_seq.back_transcribe())
                    element["A_Frequency"] = my_seq.count("A")
                    element["U_Frequency"] = my_seq.count("U")
                    element["C_Frequency"] = my_seq.count("C")
                    element["G_Frequency"] = my_seq.count("G")
            except:
                pass
            response.append(element)
        return Response(response, status=status.HTTP_200_OK) 
