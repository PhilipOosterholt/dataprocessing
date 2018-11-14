# Philip Oosterholt 10192263

import pandas as pd
import numpy as np
import statistics as stat
import matplotlib.pyplot as plt
import json
import plotly as plotly
import plotly.plotly as py
import plotly.graph_objs as go

plotly.tools.set_credentials_file(username='Poosterholt', api_key='bzD9L5dwgYn9Zs0eM42J')

def stats_country(data_type):

    # calculate mean, median, mode and standard deviation
    mean = int(df.loc[:, data_type].mean())
    median = int(df.loc[:, data_type].median())
    mode = stat.mode(df.loc[:, data_type])
    std = int(df.loc[:, data_type].std())

    print('Mean:', mean)
    print('Median:', median)
    print('Mode:', mode)
    print('Standard deviation:', std)

def five_numbers(data_type):

    # calculate five numbers summary
    q1 = df[data_type].quantile(q=0.25)
    q3 = df[data_type].quantile(q=0.75)
    min = df.loc[:, data_type].min()
    max = df.loc[:, data_type].max()
    median = df.loc[:, data_type].median()

    print('Quartile 1:', q1)
    print('Quartile 3:', q3)
    print('Minimum:', min)
    print('Maximum:', max)
    print('Median:', median)

input = 'input.csv'

# reading csv file as a pandas DataFrame
df = pd.read_csv(input, sep=',', index_col='Country', usecols=['Country', 'Region', 'Pop. Density (per sq. mi.)',
    'Infant mortality (per 1000 births)', 'GDP ($ per capita) dollars'])

# rename columns
df = df.rename(columns={'Pop. Density (per sq. mi.)': 'Density', 'Infant mortality (per 1000 births)': 'Infant',
 'GDP ($ per capita) dollars': 'GDP'})

# strip dollars and whitespace
df = df.apply(lambda x: x.str.strip('dollars') if x.dtype == "object" else x)
df = df.apply(lambda x: x.str.strip() if x.dtype == "object" else x)

# remove rows with missing data
df = df[df != 'unknown']
df = df.dropna()

# set GDP to integer
df['GDP'] = df.GDP.astype(int)

# calculate mean, median, mode and standard deviation GDP
stats_country("GDP")

# remove outliers for histogram (for bins)
hist = df[df.GDP < 40000]

# plot histogram
plt.hist(hist['GDP'], bins=20, alpha=0.8, rwidth=0.85)

# limits, ticks, labels, title
plt.xlim([0, 40000])
plt.xticks(np.arange(2000, 40000, step=4000))
plt.xlabel('GDP')
plt.ylabel('Frequency')
plt.title('Distribution of GDP ($ per capita) dollars')

# removing ugly frame lines
ax = plt.subplot()
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)

plt.show()

# convert Infant and Density to float
df['Infant'] = (df['Infant'].str.split()).apply(lambda x: float(x[0].replace(',', '.')))
df['Density'] = (df['Density'].str.split()).apply(lambda x: float(x[0].replace(',', '.')))
df['Density'] = df.Density.astype(float)
df['Infant'] = df.Infant.astype(float)

# five numbers summary
five_numbers('Infant')

# remove outliers for boxplot
box = df[df.Infant < 150]

# plot boxplot
fig, ax = plt.subplots()
ax.set_title('Infant mortality')
ax.set_xlabel('Box plot 1')
ax.set_ylabel('Infant mortality per 1000')
ax.boxplot(box['Infant'])
plt.show()

# ploty plot
# send data to ploty
box = df['Infant']

# box plot
boxplot = go.Box(
    y=box,
    name='Box Plot'
)

# layout plot
layout = go.Layout(
    title = "Box Plot Infant Mortality",
    yaxis=dict(
        title='Child Mortality per 1000 births',
        zeroline=False
    )
)

data = [boxplot]
fig = go.Figure(data=data,layout=layout)

# push plot to ploty
# py.iplot(fig, filename = "Box Plot Data Processing")

# turn DataFrame into json object
data = df.to_json(orient='index')

# write json object to file
with open('data.json', 'w') as outfile:
    outfile.write(data)
    outfile.close()

# scatter data
X = np.array(df['Infant'])
Y = np.array(df['GDP'])

# linear regression
denominator = sum((X - X.mean()) ** 2)
a = sum((X - X.mean()) * (Y - Y.mean())) / denominator
b = Y.mean() - a * X.mean()
line = X * a + b

# scatter
scatter = plt.scatter(X, Y, c='blue', alpha=0.3)
plt.plot(X, line, color='red', linestyle='-', linewidth=2, alpha=0.9)

# axis
plt.axis([0, 200, 0, 45000])
plt.xticks(np.arange(20, 220, step=20))
plt.yticks(np.arange(0, 40000, step=5000))

# title
plt.title('Relation GDP and Infant mortality')
plt.xlabel('Child Mortality per 1000 Births')
plt.ylabel('GPD per Capita')

# removing ugly frame lines
ax = plt.subplot()
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)

plt.show()
