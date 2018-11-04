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

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {}

if __name__ == "__main__":

    years = []
    ratings = []

    with open(INPUT_CSV, newline='') as csvfile:

        reader = csv.reader(csvfile)

        for row in reader:
            years.append(row[2])
            ratings.append(row[1])

        del years[0]
        del ratings[0]

        movies = defaultdict(list)

        for i in range(len(years)):
            movies[years[i]].append(ratings[i])

        for year in range(START_YEAR, END_YEAR):
            x = movies[str(year)]
            x = np.array(x)
            x = x.astype(np.float)
            data_dict[str(year)] = round(np.mean(x),1)

        x = list(range(START_YEAR, END_YEAR))
        y = []
        print(x)

        for i in range(len(x)):
            y.append(data_dict[str(x[i])])

        plt.plot(x, y)
        plt.xlabel("Year")
        plt.ylabel("Rating")
        plt.show()
