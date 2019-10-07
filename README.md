# appointment-server

## Introduction

Digital Angels is an innovative new startup that uses AI to learn each person’s specific needs, personalised to their body, to provide the best massage experience through a new robot. However, there is currently only one robot, so customers must book appointments first.

This is a new system to create bookings for massages that is available on the web as they required.

## Description

This system is implemented by NodeJS and Google Calendar API. User can check bookable dates, available time slots and book an appointment.

## Rules

* All appointments are **40 minutes** long and have fixed times, starting from 9–9:40 am.
* There is always a **5 minute break** in between each appointment.
* Appointments can only be booked during **weekdays** from **9 am to 6 pm**.
* Bookings can only be made at least **24 hours** in advance.
* Appointments cannot be booked in the past.
* ALl bookings and days are returned in **UTC time**.

## Endpoints

- **Get bookable days**

```
GET  /days?year=yyyy&month=mm
```

- **Get available time slots**

```
GET  /timeslots?year=yyyy&month=mm&day=dd
```

- **Book an appointment**

```
POST  /book?year=yyyy&month=MM&day=dd&hour=hh&minute=mm
```
