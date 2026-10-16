# TRACE-DT website

Every page is a plain text file written in Markdown. GitHub turns these into the website automatically. You never touch HTML.

## 1. How to edit any page, in steps

1. Open your repository on GitHub.
2. Click the file you want to change (see the table below).
3. Click the pencil icon near the top right.
4. Change the words. Keep the lines that start with `---` and keep quotation marks where they are.
5. Scroll down and click the green **Commit changes** button.
6. Wait one or two minutes, then refresh the site. Your change is live.

## 2. Which file holds what

| To change | Open this file |
|---|---|
| Site name, email, highlight colour, the Register link, the right-hand panel, the menu | `_config.yml` |
| Home headline, intro line, and the two home sections | `index.md` |
| People, communities and institutions | `participants.md` |
| News | `news.md` |
| Outputs and publications | `publications.md` |
| Contact | `contact.md` |

You never need to open the `_layouts` and `assets` folders. They hold the design and the interactive bridge.

## 3. The interactive bridge

The home page shows a live digital twin. Visitors drag the truck along the deck and move the damage slider; the twin re-estimates the first natural frequency and raises an alarm when it drops. It is illustrative and needs no editing. If you ever want it removed, delete the `demo-hero` block from `_layouts/home.html`.

## 4. The "Register your interest" button

The button appears in several places. Right now it has no link set, so it does nothing until you add one. To collect names in a spreadsheet:

1. Open Google Forms and create a short form (name, email, organisation).
2. In the form, open the **Responses** tab and click the green Sheets icon. Google makes a spreadsheet that fills in by itself.
3. Click **Send**, choose the link icon, and copy the link.
4. In `_config.yml`, paste that link between the quotes after `register_url:`.

## 5. The right-hand panel

The panel shown beside every page (At a glance, Links, and the Join box) is built from `_config.yml`. Edit `rail_facts` and `rail_links` there to change it once for the whole site.

## 6. Common jobs

**Add a news item.** In `news.md`, copy one item (the `###` heading, the date line and the text). Paste it at the top, under the note, and change the words.

**Add your photo.** In the repository, open `images/people`, click **Add file**, then **Upload files**, and upload your photo (for example `basuraj.jpg`). Then in `participants.md`, change `photo-placeholder.svg` to `basuraj.jpg`. Keep `{: .portrait}` at the end of that line.

**Add a PDF.** Upload it into a folder called `files`, then link to it, for example `[Download the Policy Brief](files/policy-brief.pdf)`.

**Change the highlight colour.** In `_config.yml`, change the value after `highlight:`. Engineering blue `#0078ae` is the Strathclyde faculty colour.

## 7. Markdown in one minute

| You type | You get |
|---|---|
| `## Heading` | Section heading |
| `### Smaller heading` | Item heading |
| `**bold**` | bold |
| `*italic*` | italic (use it for dates) |
| `- item` | Bullet point |
| `[text](https://link)` | Link |

## 8. If something breaks

- The whole site stops updating: the cause is usually `_config.yml` or the top of `index.md`. A quotation mark may be missing, or a colon added inside the text.
- To find the error: open the **Actions** tab. The latest run shows a red cross and a message.
- To undo: open the file, click **History**, and copy back the last working version.
