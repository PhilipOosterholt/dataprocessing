#!/usr/bin/env python
# Name: Philip Oosterholt
# Student number: 10192263
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup as soup
from urllib.request import urlopen as ureq

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'


def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    - Title
    - Rating
    - Year of release (only a number!)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """
    # select container with move info
    containers = dom.findAll("div", {"class":"lister-item-content"})

    # open csv file
    filename = "movies.csv"
    f = open(filename, "w")

    # create header, start writing to file
    headers = "title,rating,year,actors,runtime\n"
    f.write(headers)

    for container in containers:

        # grab title from html
        title = container.a.text

        # grab rating from html
        rating = container.findAll("div",{"class": "inline-block ratings-imdb-rating"})
        rating = rating[0]['data-value']

        # grab year, strip all the unnessary parts at once (other method is .replace)
        year = container.findAll("span",{"class": "lister-item-year text-muted unbold"})
        year = ''.join(i for i in year[0].text if i.isdigit())

        # grab runtime, remove unnessary parts
        runtime = container.findAll("span",{"class": "runtime"})
        runtime = runtime[0].text.replace(" min", "")

        # grab names of actors
        actors = container.findAll("p",{"class", ""})
        actors = actors[1].text.split("Stars:")

        if len(actors) > 1:
            # put string into 1 line, replace comma's with ; for csv
            actors = actors[1].replace("\n", "")
            actors = actors.replace(",", ";")

        # catch situations where the actors of the movie are unkown or not present
        if actors == ['\n']:
            actors = 'Unkown/no actors'

        # write to csv file
        f.write(title.replace(",", " ") + "," + rating + "," + year + "," + actors + "," + runtime + "\n")

    f.close()

# not neseccary
# def save_csv(outfile, movies):


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # I used 100,000 votes instead of 5,000 so the list contains famous movies
    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = soup(html, 'html.parser')
    extract_movies(dom)
