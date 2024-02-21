![Journ logo](readme/logo.webp "Journ Web App Logo")

# Journ: A Digital Scrapbooking Web App

**[Journ](https://journ.melodyho.dev)** is a digital scrapbooking web app that enables users to document moments using images, videos, and text. Users can attach custom tags to their entries, creating a highly dynamic scrapbook that can be filtered for different views.

**Demo:** <https://journ.melodyho.dev>

![Journ screenshot](readme/screenshot.webp "Journ Web App Screenshot")

## Making Of

**Technology:** CSS Modules, React, Next.js, Sequelize, AWS S3

### Authenticating User

Sessions are authenticated with tokens containing user information, which are stored in cookies after verifying credentials. Passwords are hashed using [argon2](https://github.com/ranisalt/node-argon2), and tokens are encrypted using [@hapi/iron](https://github.com/hapijs/iron/tree/master).

### Uploading Multiple Images/Videos

Distinguish the captions and/or tags of each entry in a batch upload by assigning unique indexes to each file and attaching these indexes to their respective inputs.

### Optimizing Image Upload/Retrieval

Before uploading, images are resized and converted to WebP format to reduce file size while preserving sufficient quality.

### Creating Scrapbook Square Masonry Layout

A grid of squares is utilized for the layout, where each entry randomly occupies either 1 square (small) or 4 squares (large), resulting in a square masonry appearance.

### Using SQL Database

A SQL database is used to filter entries based on their creation date, entry type (text, image, video), and tags.

### Storing Image/Video Files

Images and videos are stored in S3. Each file is identified by the user's SQL database ID and the SQL database ID of the entry to which it belongs.

## Known Issues

- Entry dates are currently recorded in Coordinated Universal Time (UTC) regardless of the user's location. The implementation of time zones is included in the features roadmap.

## Features Roadmap

### Account Deletion

Allow users to delete their accounts.

### Dates

#### Time Zones

Implement user-specific time zones.

#### Show Entry Dates

Display the date when viewing an entry.

#### Edit Entry Dates

Provide users the ability to edit entry dates.

### Toggle Image/Video Captions

Provide users with the option to show/hide captions in the feed for images and videos.

### Toggle Video Audio

Provide users the ability to easily toggle video audio on or off while browsing the feed.

### Customize Feed Layout

Provide users the ability to personalize the randomly generated layout to suit their preferences.

### Share Layouts

Provide users the ability to share a specific layout through a link.

## Disclaimer

The link provided above directs to a demo. Please note that data may be deleted without prior notice to make room for additional storage space on servers.

## Copyright

© 2024 Melody Ho. All rights reserved.

## Creator

**Melody Ho**  
<melodyho.contact@gmail.com>  
[Portfolio](https://www.melodyho.dev) | [GitHub](https://www.github.com/melody-ho) | [LinkedIn](https://www.linkedin.com/in/melodyho-dev)
