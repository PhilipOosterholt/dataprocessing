#!/usr/bin/env python
# Name:
# Student number:
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt
from collections import defaultdict
import numpy as np
import pandas as pd

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {}
movies = defaultdict(list)

if __name__ == "__main__":

    years, ratings, y = [], [], []

    with open(INPUT_CSV, newline='') as csvfile:

        reader = csv.DictReader(csvfile)

        for row in reader:
            movies[row['year']].append(row['rating'])

        # averaging scores per year
        for year in range(START_YEAR, END_YEAR):
            year_ratings = np.array(movies[str(year)])
            year_ratings = year_ratings.astype(np.float)
            data_dict[str(year)] = round(np.mean(year_ratings), 1)

        # create array with all the years
        x = list(range(START_YEAR, END_YEAR))

        # create array with all the mean ratings of said year
        for i in range(len(x)):
            y.append(data_dict[str(x[i])])

        # initiate plot
        plot = plt.plot(x, y)

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

        # setting y limits to emphasize the differences between years
        plt.ylim(7.7, 8.8)

        # visualize plot
        plt.show()
