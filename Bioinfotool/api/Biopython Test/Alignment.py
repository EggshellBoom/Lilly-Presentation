from Bio import pairwise2
from Bio.pairwise2 import format_alignment
import os
from Bio import AlignIO
from os import path
from Bio.Phylo.TreeConstruction import DistanceCalculator,DistanceTreeConstructor
from Bio import Phylo

alignments = pairwise2.align.globalmx("ACCGTTTTTTTTTTTTTTTTTTTTTTTTTTT", "ACG",2,-1)
print(alignments[0].seqA)
print(alignments)
os.system(".\muscle.exe -in opuntia.fasta -out c.fasta")
while not path.exists("c.fasta"):
    pass
alignment = AlignIO.read("c.fasta","fasta")
calculator = DistanceCalculator('identity')
constructor = DistanceTreeConstructor(calculator)
tree = constructor.build_tree(alignment)
Phylo.write(tree, "tree.tree", "newick")
