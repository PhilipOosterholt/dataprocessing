from bs4 import BeautifulSoup as soup
from urllib.request import urlopen as ureq

my_url = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=100000,&sort=user_rating,desc"

# # opening connections grabbing page
# uClient = ureq(my_url)
# page_html = uClient.read()
# uClient.close()

# html parsing
page_soup = soup(page_html, "html.parser")

# select container with move info
containers = page_soup.findAll("div", {"class":"lister-item-content"})

# open csv file
filename = "movies.csv"
f = open(filename, "w")

# create header, start writing to file
headers = "title, rating, year, actors, runtime\n"
f.write(headers)

for container in containers:

    # grab title from html
    title = container.a.text

    # grab rating from html
    rating = container.findAll("div",{"class": "inline-block ratings-imdb-rating"})

    # turning integer into float then back in string to avoid rounding in excel
    rating = str(float(rating[0]['data-value']))

    # grab year, remove unnessary parts
    year = container.findAll("span",{"class": "lister-item-year text-muted unbold"})
    year = year[0].text.replace("(", "")
    year = year.replace(")", "")

    # grab runtime, remove unnessary parts
    runtime = container.findAll("span",{"class": "runtime"})
    runtime = runtime[0].text.replace(" min", "")

    # grab names of actors
    actors = container.findAll("p",{"class", ""})
    actors = actors[1].text.split("Stars:")

    # if the movie has actors/directors - could happen in small unkown movies
    if len(actors) > 1:
        # put string into 1 line, replace comma's with ; for csv
        actors = actors[1].replace("\n", "")
        actors = actors.replace(",", ";")

    # write to csv file
    f.write(title.replace(",", " ") + "," + ratings + "," + years + "," + actors + "," + runtimes + "\n")

f.close()
