#!/usr/bin/env python
# Name: Philip Oosterholt
# Student number: 10192263
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
import re
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup as soup
from urllib.request import urlopen as ureq

TARGET_URL = "https://www.imdb.com/title/tt0116282/?ref_=nm_knf_t1"



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

        # A list of strings representing the following (in order): title, year,
        # duration, genre(s) (semicolon separated if several), director(s)
        # (semicolon separated if several), writer(s) (semicolon separated if
        # several), actor(s) (semicolon separated if several), rating, number
        # of ratings.

if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)
    soup = soup(html, 'html.parser')
    page = soup.findAll("div", {"id":"ratingWidget"})

    text = page[0].p.text
    text = str(text)
    title = text.splitlines()[2]
    title = title.strip()

    print(title)

    year = text.splitlines()[3]
    year = year.strip()
    year = year.replace(")", "")
    year = year.replace("(", "")

    runtime = soup.select('time')
    runtime = runtime[1].text
    # if digit magic

    # genres
    genre = soup.findAll("div", {"class":"see-more inline canwrap"})
    genre = genre[1].text
    genre = genre.split("Genres:")
    genre = genre[1].split("|")

    genres = []

    for i in range(len(genre)):
        lines = genre[i].replace('\xa0', '')
        lines = lines.replace(" ", '')
        lines = lines.replace('\n', '')
        genres.append(lines)

    genres = ';'.join(genres)

    # credits
    credits = soup.findAll("div", {"class": "credit_summary_item"})

    # directors
    directors = []
    direct = credits[0]
    direct = direct.text.split("Directors:")
    direct = direct[1].split(",")

    for i in range(len(direct)):
        temp = direct[i]
        temp = temp.replace('\n', '')
        temp = temp.strip()
        directors.append(temp)

    if '' in directors:
        directors.remove('')

    for i in range(len(directors)):
        directors[i] = re.sub(r'\([^()]*\)', '', directors[i])

    directors = ';'.join(directors)

    # writers

    writers = []
    writer = credits[1]
    writer = writer.text.split("Writers:")
    writer = writer[1].split(",")

    for i in range(len(writer)):
        temp = writer[i]
        temp = temp.replace('\n', '')
        temp = temp.strip()
        writers.append(temp)

    if '' in writers:
        writers.remove('')

    for i in range(len(writer)):
        writers[i] = re.sub(r'\([^()]*\)', '', writers[i])

    writers = ';'.join(writers)

    # actors
    actors = []
    actor = credits[2]
    actor = actor.text.split("Stars:")
    actor = actor[1].split(",")

    for i in range(len(actor)):
        temp = actor[i]
        temp = temp.replace('\n', '')
        temp = temp.strip()
        if "|" in temp:
            temp = temp.split(' |', 1)[0]
        actors.append(temp)

    if '' in actors:
        actors.remove('')

    for i in range(len(actor)):
        actors[i] = re.sub(r'\([^()]*\)', '', actors[i])

    actors = ';'.join(actors)

    # rating

    ratings = soup.findAll("span", {"itemprop": "ratingValue"})
    rating = ratings[0].text

    votes = soup.findAll("span", {"itemprop": "ratingCount"})
    votes = votes[0].text

    # votes
