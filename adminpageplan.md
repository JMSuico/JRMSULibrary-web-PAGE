
______________________________________________


#SECTION 1#

TASK 1: START CONNECTING THE API , ENDPOINTS, BACKEND , FRONTEND AND UI AND DATABASE

TASK 2: THEN CREATE THIS MODULES IN THE ADMIN PAGE

in the adminpage

do function to create modules for the Send Email
in the bubble floating ui

the add a module name library sections in the admin page in the management add 
the add a module user management - controls the user admins only
the add a module reports - generate and print reports
the add a module Email Message - admin receive and send email messages


TASK 3: FOR NEWLY ACQUIRED BOOKS FORMULA AND LOGIC USED THIS C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\NewlyAcquiredLogin&Algorithms.md -> COMPREHENSIVELY READ, ANALYZE AND UNDERSTAND



TASK 4: in the floating bubble ui put the function Send Email and Reservation in the chat with rizal  AS  suggestions QUESTIONS



in the bubble ui Hi Im rizal make it the floating chat modal to IN THE CHAT WITH RIZAL ADD SUGGESTOIN TO 

WOULD YOU LIKE TO SEND EMAIL? - IF USER CLICK THIS THE AI WILL SUGGEST MESSAGE WITH AN UI INTERACTURE INPUT BOX WHERE THE USER CAN ANSWER THE MESSAGE

LIKE EXAMPLE SUGGESTION: USER SELECT
I WOULD YOU LIKE TO SEND EMAIL? 
AI REPLY:

INPUT YOUR SUBJECTS AND MESSAGE IN THE INPUT BOX:
Name:
[_______________]
Email:
[_______________]
SUBJECT
[______________]
MESSAGE
[______________]

THEN SUBMIT BUTTON REPLY OR CANCEL BUTTON REPLY


WOULD YOU LIKE TO RESERVE ROOM OR TABLE? -> IF USER CLICK THIS THE AI WILL SUGGEST MESSAGE WITH AN UI INTERACTURE INPUT BOX WHERE THE USER CAN ANSWER THE MESSAGE
OPTION DROPDOWN SELECT MESSAGE:
Discussion Room 1
Discussion Room 2
Tutorium Room 1
Tutorium Room 2
Library Table

INPUT YOUR SUBJECTS AND MESSAGE IN THE INPUT BOX: (admin will message you if the vacancy is not available)
Name:
[_______________]
Email:
[_______________]
SUBJECT
[______________]
MESSAGE
[______________]


in the adminpage

do function to create modules for the Send Email
in the bubble floating ui

which admin may also received the messages and can reply them to automatically send in the email





then apply enhance using what you have learn in the C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\SKILLS\ui-ux-pro-max-skill-main

the login forms in the admin is good i want it to be like that gradiant background with the same ui in the dashboard and other modules to be more organize and clean.


in the adminpage

do function to create modules for the Send Email
in the bubble floating ui

the add a module name library sections in the admin page in the management add 
user management - controls the user admins only
reports - generate and print reports
Email Message - admin receive and send email messages





WOULD LIKE TO RATE US? - IF USER CLICK THIS THE AI WILL show floating modal card WITH AN UI INTERACTURE rate star used this uicomponents
but place it in the right layers according in the layers and structure

import React from 'react';
import styled from 'styled-components';

const Radio = () => {
  return (
    <StyledWrapper>
      <div className="rating">
        <input defaultValue={5} name="rating" id="star5" type="radio" />
        <label htmlFor="star5" />
        <input defaultValue={4} name="rating" id="star4" type="radio" />
        <label htmlFor="star4" />
        <input defaultValue={3} name="rating" id="star3" type="radio" />
        <label htmlFor="star3" />
        <input defaultValue={2} name="rating" id="star2" type="radio" />
        <label htmlFor="star2" />
        <input defaultValue={1} name="rating" id="star1" type="radio" />
        <label htmlFor="star1" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .rating {
    display: inline-block;
  }

  .rating input {
    display: none;
  }

  .rating label {
    float: right;
    cursor: pointer;
    color: #ccc;
    transition: color 0.3s;
  }

  .rating label:before {
    content: '\2605';
    font-size: 30px;
  }

  .rating input:checked ~ label,
  .rating label:hover,
  .rating label:hover ~ label {
    color: #6f00ff;
    transition: color 0.3s;
  }`;

export default Radio;
