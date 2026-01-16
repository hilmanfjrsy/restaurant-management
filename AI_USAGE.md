# AI Usage

I Use AI to help me develop this project. Here is prompt I use to generate the code:

## Dashboard
```
1. i'm new to using Vue. I want to refactor dashboard ui to restaurant table reservation, it has button to add new table, button for reservation table, change status reservation, and each table has status, capacity and location table.\n---\nonly focus on layouting\nremove current dummy view
2. i want to change:\n- the design to minimalist and clean\n- show information capacity\n- can multiple selected table\n- responsive\n- cant selected reserved\n\ngive me your placeholder before implement
3. the background is good, legend position is not good and color is too much similar, change color palete give recomendation for color pallete
4. implement unit test for dashboard
5.  => ERROR [dashboard builder 6/6] RUN bun run build                                                                                                                                                   6.0s
------
 > [dashboard builder 6/6] RUN bun run build:
  0.622 $ run-p type-check "build-only {@}" --
  0.875 $ vue-tsc --build
  0.875 $ vite build
  2.406 vite v7.3.1 building client environment for production...
  2.631 transforming...
  5.036 src/main.ts(7,17): error TS2307: Cannot find module './App.vue' or its corresponding type declarations.
  5.036 src/router/index.ts(2,22): error TS2307: Cannot find module '../views/HomeView.vue' or its corresponding type declarations.
  5.513 ✓ 152 modules transformed.
  5.719 rendering chunks...
  5.728 computing gzip size...
  5.742 dist/index.html                   0.43 kB │ gzip:  0.29 kB
  5.742 dist/assets/index-B0_ZB_kY.css   26.15 kB │ gzip:  5.51 kB
  5.742 dist/assets/index-YMHIBbxX.js   198.99 kB │ gzip: 71.30 kB
  5.743 ✓ built in 3.23s
  5.869 ERROR: "type-check" exited with 2.
  5.876 error: script "build" exited with code 1
  ------
  failed to solve: process "/bin/sh -c bun run build" did not complete successfully: exit code: 1
```

## Backend
```
1. inside /packages has a shared database connection, now i want to create shared event using rabbitmq
2. create unit test for tables and reservation service
3. - create 1 github workflow for run unit test coverage dashboard, reservation-service, table-service, has each step and not depends each other
    - create docker file and docker compose for setup in local
    - create readme about this repo and how to run all service in root path
4. failed to solve: invalid link packages/db/node_modules/@drizzle-team/brocli/README.md to unknown path: "node_modules/@drizzle-team/brocli/README.md"

  ---

  fix it
5. > [reservation-service builder 7/7] RUN bun install --frozen-lockfile:
  0.591 bun install v1.3.6 (d530ed99)
  0.596 7 |     "table-service",
  0.596         ^
  0.596 error: Workspace not found "table-service"
  0.596     at /app/package.json:7:5
  ------
  ------
  > [table-service builder 7/7] RUN bun install --frozen-lockfile:
  0.585 bun install v1.3.6 (d530ed99)
  0.592 8 |     "reservation-service"
  0.592         ^
  0.592 error: Workspace not found "reservation-service"
  0.592     at /app/package.json:8:5
  ------
  failed to solve: process "/bin/sh -c bun install --frozen-lockfile" did not complete successfully: exit code: 1

6. 2026-01-16 21:06:44 error: Expected ConnectionOpenOk; got <ConnectionClose channel:0>
  2026-01-16 21:06:44       at <anonymous> (/app/node_modules/amqplib/lib/connection.js:113:20)
  2026-01-16 21:06:44       at <anonymous> (/app/node_modules/amqplib/lib/connection.js:104:11)
  2026-01-16 21:06:44       at recv (/app/node_modules/amqplib/lib/connection.js:453:9)
  2026-01-16 21:06:44       at emit (node:events:92:22)
  2026-01-16 21:06:44       at emitReadable_ (internal:streams/readable:395:16)
  2026-01-16 21:06:44 
  2026-01-16 21:06:44 Bun v1.3.6 (Linux x64 baseline)
  2026-01-16 21:06:44 error: script "start" exited with code 1
```