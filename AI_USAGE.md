# AI Usage

I Use AI to help me develop this project. Here is prompt I use to generate the code:

## Dashboard
```
1. i'm new to using Vue. I want to refactor dashboard ui to restaurant table reservation, it has button to add new table, button for reservation table, change status reservation, and each table has status, capacity and location table.\n---\nonly focus on layouting\nremove current dummy view
2. i want to change:\n- the design to minimalist and clean\n- show information capacity\n- can multiple selected table\n- responsive\n- cant selected reserved\n\ngive me your placeholder before implement
3. the background is good, legend position is not good and color is too much similar, change color palete give recomendation for color pallete
4. implement unit test for dashboard
```

## Backend
```
1. inside /packages has a shared database connection, now i want to create shared event using rabbitmq
2. create unit test for tables and reservation service
3. - create 1 github workflow for run unit test coverage dashboard, reservation-service, table-service, has each step and not depends each other
- create docker file and docker compose for setup in local
- create readme about this repo and how to run all service in root path
```