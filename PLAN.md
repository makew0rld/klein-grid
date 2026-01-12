# Project Plan

This document was written by a human, to be interpreted mainly by an LLM.
It should not be edited by an AI agent.

This project is to create a Klein Grid (Klein Sexual Orientation Grid) quiz website.
The details of the Klein Grid are available on Wikipedia: https://en.wikipedia.org/wiki/Klein_Sexual_Orientation_Grid

There is already such a quiz available on bi.org, but it's poorly designed. Let's
make a better one!

## Website content
- Intro paragraph briefly explaining what the Klein Grid quiz is and linking to Wikipedia
- The questionnaire follows, all questions on the same page
- Get questions from Wikipedia, ask me if you can't extract them from the table
- Each question has an answer section below it obviously
    - The answer section has past, present, future as Wikipedia says
    - The past/present/future should be explained in each answer section, beside their words
    - Past = "adolescence to one year ago"
    - Present = "last 12 months"
    - Future = "ideal"
- Button at the bottom to show your results
- Clicking the button transforms the page to show a table of results
- The results are also stored in the URL fragment
    - Maybe these can just be the answer numbers concatenated? Eg. #17341...
    - The user can share this URL to share their results
    - This is made obvious in the UI with a share or copy link button
- The results table
    - Horizontal header of past, present future
    - Vertical header of each question
    - In the cell is the user's answer (1-7)
    - The cells should be coloured using a gradient of the bi flag colours
        - Pink #D60270 for same sex (7)
        - Blue #0038A8 for other sex (1)
        - Lavender #9B4F96 for the middle (4)
        - Probably oklch should be used to from the gradient, idk
    - Finally there should be an additional part of the table that shows averages and overall
        - Scores are average for past, present, future to give a score
        - And then there is a merged cell that gives an overall scores
        - These scores should be in text rather than numerical
        - This text isn't on Wikipedia, generate something for 1-7 and we'll iterate on it
        - Some example texts: Bi: Heterosexual Leaning (3), Bi: Mostly Heterosexual (2), Bisexual (4)
            - Heterosexual (1), Homosexual (7)
- Above the table is a scale from 1 to 7 reminding the user what the numbers mean
    - 1 = "other sex only" or "heterosexual only"
    - Etc, see Wikipedia
    - Note the scale has to cover the two different meanings
    - It should use the same colours as the results table somehow
- There should be a simple header and footer that appears both during the quiz and results
- Header: just a title for the site "Klein Grid"
- Footer
    - Link to GitHub repo (makew0rld/klein-grid)
    - Link to my website (www.makeworld.space)
    - Credit to me (makeworld) and Claude Code
    - License info (MIT)
    - Brief privacy msg: no user data is ever retained

## Website design
- No React, only vanilla JS
- Don't use Vite or have a build step or anything
- In fact, no third party dependencies should be necessary
- Use CSS classes for repeated elements over a Tailwind utility class style
- Standalone website
- Mobile friendly, responsive, etc
- Home page is clean and in dark mode
- No server-side interaction, this is a static site
- Single page site, using URL fragment for client-side data if necessary
- There can be multiple files overall (eg for CSS and JS) if having only one becomes too messy
- Fast: no external fonts, no images, no CDN JS
- Make sure it's accessible!

## Other
- Identify yourself in commits you make, don't use my email/name/GPG signing
    - But do that when you commit, through the command line or something?
    - Like let me still make my own commits without the whole repo settings being tied to you
    - Don't push your own commits, I'll do that
