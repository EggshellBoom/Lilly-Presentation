from Bio import pairwise2
from Bio.pairwise2 import format_alignment
import os
from Bio import AlignIO
from os import path
alignments = pairwise2.align.globalmx("ACCGTTTTTTTTTTTTTTTTTTTTTTTTTTT", "ACG",2,-1)
print(alignments[0].seqA)
print(alignments)
os.system("./muscle -in opuntia.fasta -out c.fasta")
while not path.exists("c.fasta"):
    pass
alignment = AlignIO.read("c.fasta","fasta")
print(alignment)
for seq in alignment:
    print(seq)