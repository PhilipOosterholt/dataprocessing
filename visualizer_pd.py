#!/usr/bin/env python
# Name:
# Student number:
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# Global constants for the input file, first and last year
INPUT = "movies.csv"

if __name__ == "__main__":

    # names = ['rating', 'year']
    df = pd.read_csv(INPUT, sep=';')
    grouped = df.groupby('year').mean()
    year = list(range(2008, 2018))

    # initiate plot
    plot = plt.plot(year, grouped.values)

    # titles
    plt.title("'08 and '18")
    plt.suptitle("Average Rating of Movies on IMDB", fontsize=14)
    plt.xlabel("Year")
    plt.ylabel("Rating")

    # linestyle, width and color
    plt.setp(plot, linestyle='-', linewidth=2, color='r', alpha=0.5)

    # removing ugly frame lines
    ax = plt.subplot()
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    # moving the labels a bit further a way from the plot
    ax.xaxis.labelpad = 10
    ax.yaxis.labelpad = 10

    # visualize plot
    plt.show()
