import pandas as pd
import csv
import json



database = 'dataset.csv'
country_ids = 'list_ids.csv'
worldmap = 'world_population.csv'

# reading and renaming data
df = pd.read_csv(database, sep=';', usecols=['year', 'country', 'nkill'])
# cleaning data
df = df.dropna()
df = df[df.nkill != 0]
# df = df[df.attacktype != 'Unknown']
# df = df[df.weaptype1_txt != 'Unknown']
# df = df[df.targtype1_txt != 'Unknown']
# select years attacks of the last 10 years
df = df[df.year.between(2007, 2017)]
pd.set_option('display.max_row', 1000)

df_line = df.groupby(['country', 'year']).sum().reset_index()

# print(df_line)

# sum all kills based on country
df = df.drop(columns = 'year')
df = df.groupby(['country']).sum()
# df = df.set_index('country')

# import country codes
df_ids = pd.read_csv(country_ids, sep=';', usecols=['country', 'id'])
df_ids = df_ids.set_index('country')
df1 = df.join(df_ids)
df1 = df1[df1.id != 'not listed']

df2 = pd.read_csv(worldmap, sep=',', usecols=['id', 'country', 'Column1'])
df2 = df2[df2.Column1 != 'not listed']
df2 = df2.drop(columns = 'Column1')
df2 = df2.set_index('id')
df1 = df1.set_index('id')
df_new = df2.join(df1['nkill'])
df_new = df_new.fillna(0)

# print(df_line)
df_new.to_csv('test.csv')

# make a dictionary

countries = {}
type = {}
years = {2007: 0, 2008: 0, 2009: 0, 2010: 0, 2011: 0, 2012: 0, 2013: 0, 2014: 0, 2015: 0, 2016: 0, 2017: 0}

# create list with all countries with deaths related to Terrorism
list_countries = df_new['country'].unique()

# for country in list with countries
for i in list_countries:
     # make a key country with 10 different years
    countries[i] = years

# load data from pandas dataframe, convert into dictionary
for c in list_countries:
    country = df_line[df_line.country==c]
    for i in range(len(country)):
        year = country.iloc[i][1]
        countries[c][year] = country.iloc[i][2]

#Get the file name for the new file to write
filter = "JSON File (*.json)|*.json|All Files (*.*)|*.*||"
filename = 'bar.json'

# If the file name exists, write a JSON string into the file.
if filename:
    # Writing JSON data
    with open(filename, 'w') as f:
        json.dump(countries, f)
