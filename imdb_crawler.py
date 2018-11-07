#!/usr/bin/env python
# Name:
# Student number:
"""
This script crawls the IMDB top 250 movies.
"""

import os
import csv
import codecs
import errno
import re

from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

# global constants
TOP_250_URL = 'http://www.imdb.com/chart/top'
OUTPUT_CSV = 'top250movies.csv'
SCRIPT_DIR = os.path.split(os.path.realpath(__file__))[0]
BACKUP_DIR = os.path.join(SCRIPT_DIR, 'HTML_BACKUPS')

# --------------------------------------------------------------------------
# Utility functions (no need to edit):


def create_dir(directory):
    """
    Create directory if needed.
    Args:
        directory: string, path of directory to be made
    Note: the backup directory is used to save the HTML of the pages you
        crawl.
    """

    try:
        os.makedirs(directory)
    except OSError as e:
        if e.errno == errno.EEXIST:
            # Backup directory already exists, no problem for this script,
            # just ignore the exception and carry on.
            pass
        else:
            # All errors other than an already existing backup directory
            # are not handled, so the exception is re-raised and the
            # script will crash here.
            raise


def save_csv(filename, rows):
    """
    Save CSV file with the top 250 most popular movies on IMDB.
    Args:
        filename: string filename for the CSV file
        rows: list of rows to be saved (250 movies in this exercise)
    """
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            'title', 'runtime', 'genre(s)', 'director(s)', 'writer(s)',
            'actor(s)', 'rating(s)', 'number of rating(s)'
        ])

        writer.writerows(rows)


def make_backup(filename, html):
    """
    Save HTML to file.
    Args:
        filename: absolute path of file to save
        html: (unicode) string of the html file
    """

    with open(filename, 'wb') as f:
        f.write(html)


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


def main():
    """
    Crawl the IMDB top 250 movies, save CSV with their information.
    Note:
        This function also makes backups of the HTML files in a sub-directory
        called HTML_BACKUPS (those will be used in grading).
    """

    # Create a directory to store copies of all the relevant HTML files (those
    # will be used in testing).
    print('Setting up backup dir if needed ...')
    create_dir(BACKUP_DIR)

    # Make backup of the IMDB top 250 movies page
    print('Access top 250 page, making backup ...')
    top_250_html = simple_get(TOP_250_URL)
    top_250_dom = BeautifulSoup(top_250_html, "lxml")

    make_backup(os.path.join(BACKUP_DIR, 'index.html'), top_250_html)

    # extract the top 250 movies
    print('Scraping top 250 page ...')
    url_strings = scrape_top_250(top_250_dom)

    # grab all relevant information from the 250 movie web pages
    rows = []

    for i, url in enumerate(url_strings):  # Enumerate, a great Python trick!
        print('Scraping movie %d ...' % i)

        # Grab web page
        movie_html = simple_get(url)

        # Extract relevant information for each movie
        movie_dom = BeautifulSoup(movie_html, "lxml")
        rows.append(scrape_movie_page(movie_dom))

        # Save one of the IMDB's movie pages (for testing)
        if i == 83:
            html_file = os.path.join(BACKUP_DIR, 'movie-%03d.html' % i)
            make_backup(html_file, movie_html)

    # Save a CSV file with the relevant information for the top 250 movies.
    print('Saving CSV ...')
    save_csv(os.path.join(SCRIPT_DIR, 'top250movies.csv'), rows)


# --------------------------------------------------------------------------
# Functions to adapt or provide implementations for:

def scrape_top_250(soup):
    """
    Scrape the IMDB top 250 movies index page.
    Args:
        soup: parsed DOM element of the top 250 index page
    Returns:
        A list of strings, where each string is the URL to a movie's page on
        IMDB, note that these URLS must be absolute (i.e. include the http
        part, the domain part and the path part).
    """

    movie_urls = []
    imdb = "https://www.imdb.com"
    # select container with move info
    containers = soup.findAll("td",{"class": "titleColumn"})

    for container in containers:
        movie_url = container.a
        movie_url = imdb + movie_url['href']
        movie_urls.append(movie_url)

    return movie_urls


def scrape_movie_page(dom):
    """
    Scrape the IMDB page for a single movie
    Args:
        dom: BeautifulSoup DOM instance representing the page of 1 single
            movie.
    Returns:
        A list of strings representing the following (in order): title, year,
        duration, genre(s) (semicolon separated if several), director(s)
        (semicolon separated if several), writer(s) (semicolon separated if
        several), actor(s) (semicolon separated if several), rating, number
        of ratings.
    """
    multiple = False
    soup = dom
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
    print(year)

    runtime = soup.select('time')
    runtime = runtime[1].text
    print(runtime)    # if digit magic

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

    print(genres)

    # credits
    credits = soup.findAll("div", {"class": "credit_summary_item"})

    # directors
    directors = []
    direct = credits[0]
<<<<<<< HEAD

    if "Directors" in direct.text:
=======
    if "Director" in direct.text:
        direct = direct.text.split(":")
        directors[0] = direct[1]
    else:
>>>>>>> b69f977cafcfd0e17f643c512f56c6548fac89e7
        multiple = True
        direct = direct.text.split(":")
        direct = direct[1].split(",")

<<<<<<< HEAD
        for i in range(len(direct)):
            temp = direct[i]
            temp = temp.replace('\n', '')
            temp = re.sub(r'\([^()]*\)', '', temp)
            temp = temp.strip()
            directors.append(temp)

    else:
        direct = direct.text.split(":")
        direct = direct[1].strip()
        directors.append(direct)
=======
    for i in range(len(direct)):
        temp = direct[i]
        temp = temp.replace('\n', '')
        temp = temp.strip()
        directors.append(temp)
>>>>>>> b69f977cafcfd0e17f643c512f56c6548fac89e7

    if '' in directors:
        directors.remove('')

    for i in range(len(directors)):
        directors[i] = re.sub(r'\([^()]*\)', '', directors[i])

    if multiple == True:
        directors = ';'.join(directors)

<<<<<<< HEAD
    directors = directors[0]

=======
>>>>>>> b69f977cafcfd0e17f643c512f56c6548fac89e7
    print(directors)

    # writers

    writers = []
    writer = credits[1]
<<<<<<< HEAD

    if "Writers:" in writer.text:
        writer = writer.text.split("Writers:")
        writer = writer[1].split(",")

        for i in range(len(writer)):
            if "|" in writer[i]:
                break
            temp = writer[i]
            temp = temp.replace('\n', '')
            temp = re.sub(r'\([^()]*\)', '', temp)
            temp = temp.strip()
            writers.append(temp)
    else:
        writer = writer.text.split(":")
        writer = writer[1].strip()
        writers.append(writer)
=======
    writer = writer.text.split("Writers:")
    writer = writer[1].split(",")

    for i in range(len(writer)):
        temp = writer[i]
        temp = temp.replace('\n', '')
        temp = temp.strip()
        writers.append(temp)
>>>>>>> b69f977cafcfd0e17f643c512f56c6548fac89e7

    if '' in writers:
        writers.remove('')

<<<<<<< HEAD
=======
    for i in range(len(writer)):
        writers[i] = re.sub(r'\([^()]*\)', '', writers[i])

>>>>>>> b69f977cafcfd0e17f643c512f56c6548fac89e7
    writers = ';'.join(writers)

    print(writers)

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

    # votes
    votes = soup.findAll("span", {"itemprop": "ratingCount"})
    votes = votes[0].text

    return


if __name__ == '__main__':

    main()

#
# def scrape_top_250(soup):
#     """
#     Scrape the IMDB top 250 movies index page.
#     Args:
#         soup: parsed DOM element of the top 250 index page
#     Returns:
#         A list of strings, where each string is the URL to a movie's page on
#         IMDB, note that these URLS must be absolute (i.e. include the http
#         part, the domain part and the path part).
#     """
#     movie_urls = []
#     # YOUR SCRAPING CODE GOES HERE, ALL YOU ARE LOOKING FOR ARE THE ABSOLUTE
#     # URLS TO EACH MOVIE'S IMDB PAGE, ADD THOSE TO THE LIST movie_urls.
#
#     return movie_urls
#
#
# def scrape_movie_page(dom):
#     """
#     Scrape the IMDB page for a single movie
#     Args:
#         dom: BeautifulSoup DOM instance representing the page of 1 single
#             movie.
#     Returns:
#         A list of strings representing the following (in order): title, year,
#         duration, genre(s) (semicolon separated if several), director(s)
#         (semicolon separated if several), writer(s) (semicolon separated if
#         several), actor(s) (semicolon separated if several), rating, number
#         of ratings.
#     """
#     # YOUR SCRAPING CODE GOES HERE:
#     # Return everything of interest for this movie (all strings as specified
#     # in the docstring of this function).
#     return
#
#
# if __name__ == '__main__':
#     main()  # call into the progam
#
#     # If you want to test the functions you wrote, you can do that here:
#     # ...
