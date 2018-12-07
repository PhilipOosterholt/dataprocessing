import pandas as pd

input = 'dataset.csv'

# reading and renaming data
df = pd.read_csv(input, sep=';', usecols=['year', 'country', 'attacktype',  'weaptype1_txt', 'targtype1_txt', 'nkill'])

# cleaning data
df = df.dropna()
df = df[df.nkill!= 0]
df = df[df.attacktype != 'Unknown']
df = df[df.weaptype1_txt != 'Unknown']
df = df[df.targtype1_txt != 'Unknown']

print(df)
# # turn DataFrame into json object
# data = df.to_json(orient='index')
#
# # write json object to file
# with open('data.json', 'w') as outfile:
#     outfile.write(data)
#     outfile.close()
