#!/usr/bin/env python
# Name: Philip Oosterholt
# Student number: 10192263
"""
This script visualizes data obtained from a .csv file
"""

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# Global constants for the input file
INPUT = "movies.csv"
START = 2008
END = 2018

if __name__ == "__main__":

    # reading csv file as a pandas DataFrame
    df = pd.read_csv(INPUT, sep=',', encoding = "ISO-8859-1")

    # Grouping by year and averaging ratings
    grouped = df.groupby('year')['rating'].mean()

    # years in desired range
    year = list(range(START, END))

    # initiate plot
    plot = plt.plot(year, grouped.values)

    # titles
    plt.title("Between '08 and '18", style='italic')
    plt.suptitle("Average Rating of Movies on IMDB", fontsize=14, fontweight='bold')
    plt.xlabel("Year")
    plt.ylabel("Rating")

    # linestyle, width and color
    plt.setp(plot, linestyle='-', linewidth=3, color='r', alpha=0.5)

    # removing ugly frame lines
    ax = plt.subplot()
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    # moving the labels a bit further a way from the plot
    ax.xaxis.labelpad = 10
    ax.yaxis.labelpad = 10

    # changing y limits to highlight differences in ratings
    plt.ylim(8, 8.6)

    # visualize plot
    plt.show()
