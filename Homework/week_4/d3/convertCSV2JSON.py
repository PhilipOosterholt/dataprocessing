import pandas as pd

input = 'data.csv'

# reading and renaming data
df = pd.read_csv(input, sep=';', usecols=['Year', 'Coal', 'Natural gas', 'Nuclear', 'Hydro', 'Solar', 'Biofuels', 'Oil'])

# turn DataFrame into json object
data = df.to_json(orient='index')

# write json object to file
with open('data.json', 'w') as outfile:
    outfile.write(data)
    outfile.close()
