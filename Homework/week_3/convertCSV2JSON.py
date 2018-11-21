import pandas as pd

input = 'dataset.csv'

# reading and renaming data
df = pd.read_csv(input, sep=';', index_col='ID', usecols=['ID', 'Perioden', 'TotaalBevolking_4', 'k_80JaarOfOuder_9'])
df = df.rename(columns={'Perioden': 'Jaar', 'TotaalBevolking_4': 'Bevolking', 'k_80JaarOfOuder_9': 'Tachtig'})

# cleaning data
df = df.dropna()
df['Jaar'] = df['Jaar'].str.replace('JJ00', '')

# turn DataFrame into json object
data = df.to_json(orient='index')

# write json object to file
with open('data.json', 'w') as outfile:
    outfile.write(data)
    outfile.close()
