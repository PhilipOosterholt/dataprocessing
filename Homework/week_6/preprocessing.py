import pandas as pd
import csv
import json
import numpy as np

database = 'dataset.csv'
country_ids = 'list_ids.csv'
worldmap = 'world_population.csv'

# reading and renaming data
df = pd.read_csv(database, sep=';', usecols=['year', 'country', 'nkill'])
# cleaning data
df = df.dropna()
df = df[df.nkill != 0]

# select years attacks of the last 10 years
df = df[df.year.between(2007, 2017)]
pd.set_option('display.max_row', 1000)

df_line = df.groupby(['country', 'year']).sum().reset_index()

# sum all kills based on country
df = df.drop(columns = 'year')
df = df.groupby(['country']).sum()
# df = df.set_index('country')

# import country codes
df_ids = pd.read_csv(country_ids, sep=';', usecols=['country', 'id'])
df_ids_copy = df_ids
df_ids = df_ids.set_index('country')
df1 = df.join(df_ids)
df1 = df1[df1.id != 'not listed']

df2 = pd.read_csv(worldmap, sep=',', usecols=['id', 'country', 'Column1'])
df2 = df2[df2.Column1 != 'not listed']
df2 = df2.drop(columns = 'Column1')
df2 = df2.set_index('id')
df1 = df1.set_index('id')
df1['nkill'] = df1['nkill'].round()
df_new = df2.join(df1['nkill'])
df_new = df_new.fillna(0)

df_new.to_csv('deaths.csv')

# make a dictionary
dictionary = {}

# create list with all countries with deaths related to Terrorism
list_countries = df_ids_copy['country'].unique()
list_countries = list_countries.tolist()

# for country in list with countries
for countries in list_countries:
     # I wanted to use a dictionary in dictionary, but same keys are not supported
     # I couldn't change the data in the second dictionary without altering every
     # single value, hence I've used a list
    dictionary[countries] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

# load data from pandas dataframe, convert into dictionary
for x in list_countries:

    country = df_line[df_line.country == x]

    for i in range(len(country)):

        year = country.iloc[i][1]
        year = year - 2007
        kills = country.iloc[i][2]
        dictionary[x][year] = kills

filename = 'line.json'

# If the file name exists, write a JSON string into the file.
if filename:
    # Writing JSON data
    with open(filename, 'w') as f:
        json.dump(dictionary, f)
