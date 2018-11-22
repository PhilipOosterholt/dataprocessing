import pandas as pd

input = 'dataset.csv'

# reading and renaming data
df = pd.read_csv(input, sep=';', usecols=['Perioden', 'TotaalBevolking_4', 'k_0Tot20Jaar_5', 'k_20Tot45Jaar_6', 'k_45Tot65Jaar_7', 'k_65Tot80Jaar_8',  'k_80JaarOfOuder_9'])

# cleaning data
df = df.dropna()
df['Perioden'] = df['Perioden'].str.replace('JJ00', '')

# turn DataFrame into json object
data = df.to_json(orient='index')

# write json object to file
with open('data.json', 'w') as outfile:
    outfile.write(data)
    outfile.close()
