## All the details are in this Google Docs

[![Link To Google Docs Page](https://img.shields.io/badge/Google%20Docs-blue)](https://docs.google.com/document/d/1U56IUHf5iMVGheEPgsrtYkErD1g7QbTb--wQP84golg/edit?usp=sharing)

## Team number: 

011 - 7

## Team name: 

Jackson 5

## Team members:

Caiden Gilbert
Davion Miller
Conrad Sadler
John Tran
Jingda Yu

## Application name: 

pixels

## Application MVP:
- A login page
- A registration page
- A home page
- A server that allows the UI to communicate with the database
- A database that stores user information
- Passwords must be hashed and stored in the database
- Session Management - The user must be able to log in and out of the application and the session must be maintained
- Application is built within Docker containers - you can find some updates to the docker-compose.yaml in the write-up below.

## Application Description:

  A pixel art software where you can create a plain canvas that is automatically uploaded to the database and will track changes. Fundamentally, we want to have a real-time shared canvas, private gallery, public gallery, and a blank canvas that allows users to change the pixel's color to the user's desired color. These functionalities will allow users to collaboratively color together and create pixel artwork that can be displayed to the public.
  
  In order to provide this value, we will have to create exclusive canvases where users enter a code to join the canvas so that they can color pixels. The home page will contain a navbar that will have home, gallery, login and an area to enter a code to join an exclusive canvas. When users are finished with their pixel art, they can hit submit and upload the artwork to the global gallery. This gallery will be available to all users even if they are not logged in.
  
  In order to ensure that multiple users can work in a synchronous manner, the website will have to poll from the database every second. This will be a large bottleneck in the user experience. If possible we would like to migrate to using web sockets. This migration would help to improve the user experience. Lastly, in order to let users color pixels, we must build a way for the user to select a color. In order to solve this problem, we will have to have a color picker that allows the user to select a variety of colors.

## Audience:

People who want to collaboratively and individually create pixel art online.

## Vision Statement: 

To create a fun, collaborative workspace for artists all across the globe to create pixel art together and individually. 

## Development Methodology: 

We will use a hybrid Agile development methodology as opposed to a waterfall methodology. We will do one week scrum sessions. Our methodology will focus on breaking a big problem into lots of smaller problems that can be solved in a faster manner(I.E. Sprints), which can improve the feedback cycle between group members. More importantly, we will promote individuals and interactions between team members. A big part of this is the fact each group member will select what they want to work on. Then every Friday after we meet with the TA we will talk as a group between (5:30pm -> 5:45pm) and get set up for the following week. In addition, working software is prioritized over comprehensive documentation. Lastly, we will prioritize responding to change over following a set-in-stone plan. We are also going to focus on writing good code with function commenting, and we are also going to focus on the minimum viable product.

## User Epics and Stories:

#### User epic: As an Artist, I would like to have a personal account where I can store my creations.

  - User story: As an Artist, I would like my account to be secure with a password. This will prevent other people from changing my artwork.
  - User story: As an Artist, I would like to select my username. This username will be what people identify my by in the global gallery and when I am working with friends.

#### User epic: As an Artist, I want the ability to collaborate with other artists on a single piece of artwork in real time. This will allow me to add my artistic edge to my friends  canvas.

  - User story: As an Artist, I would like to create a canvas and share it only with my friends by having a pass key. This will give us the ability to create artwork without having     to worry about other people changing our artwork.

#### User epic: As an Artist, I want the ability to color a pixel whatever color I want. This will allow me to create unique and colorful artwork.

  - User story: As an Artist, I want the ability to select the color I want by clicking on a color pallet. This will allow me to easily switch between colors.

#### User epic: As an artist, I want to share my completed pieces of artwork with everyone else. This will allow others to gain inspiration from my artwork and this will allow me to gain notoriety.

  - User story: As an Artist, I want a button that I can hit to publish my artwork globally. This will let me showcase my artwork to my friends and family.

#### User epic: As an artist, I want to be able to store my artwork privately if it is a work in progress or a private creation. This will allow me to access all of my artwork and continue working on it.

  - User story: As an Artist, I would like to have a separate page where I can view all the artwork I have created. This will allow me to make artwork that I don’t want everyone to     see.

## Communication Plan: 

Our primary mode of communication is through Slack. In case we cannot get to each other via Slack, we also have a text group chat. We will have a hard deadline for Monday at midnight. If you work on it after you need to update the group via Slack of what is being worked on and what will be completed.

## Meeting Plan: 

Meet every Friday with the TA and 15 minutes after the meeting with the TA for our group. If a team member falls behind or has problems, they will give the other team members at minimum 3 days notice and the team will decide on a meeting date to help them.

## Meeting Time: 

Friday at 5:15pm. Other than that on a case by case basis. The team has agreed to meet with the TA every Friday from 5:15 PM to 5:30 PM. The meeting will be held on zoom (https://cuboulder.zoom.us/j/91432440899)

## Use Case Diagram:

### Picture On Google Docs
Key Features (Use Cases)
Create Pixel Art Canvas – Users can start a new blank canvas for creating pixel art.
Real-Time Collaborative Drawing – Users can draw together on the same canvas simultaneously, with changes updating in real time for all collaborators.
Join Shared Canvas via Code – Users can enter a shared session code to join an existing collaborative canvas. This enables the real-time collaboration feature among multiple users.
Select Colors (Color Picker Tool) – Users have access to a color selection tool to choose drawing colors for their pixels.
Save and Upload Artwork – Users can save their artwork (e.g. locally or to their account) and upload finished pieces to the application’s gallery.
Private and Public Gallery – The app provides a Private Gallery for each user to store and view their own artworks, and a Public Gallery where users can browse all publicly shared pixel art pieces.

## Wireframes:

### On Google Docs
