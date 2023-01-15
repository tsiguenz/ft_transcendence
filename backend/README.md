# Backend

The backend is the server side of the application. When the user do a request, the frontend render the page with dynamic content like the statistics of the old games who are stored in the database. The backend is where we are collecting this informations.
For this project, we used a REST API.

<!-- TODO: remove need documentation -->
## API Methods (need documentation)

api/users

api/games

api/channels

<!-- TODO: remove comment -->
## Database (complete and do it on draw.io)

### Dimensions tables

*: primary key
+: foreign key

|d_users|
|-------|
|*int id|
|varchar name|
|blob avatar|
|boolean 2fa|
|varchar profile_link|

|d_channels|
|----------|
|*int id|
|+int is_owner|
|varchar password|

### Fact tables

|f_games|
|-------|
|*int id|
|+int p1_id|
|+int p2_id|
|int p1_score|
|int p2_score|
|+int winner|
|+int looser|
|boolean is_finished|

|f_rooms| # change the name
|-------|
|*int id|
|+int user|
|boolean is_admin|
|boolean is_ban|
|boolean is_mute|
|date ban_timer|
|date mute_timer|

|f_messages|
|----------|
|*int id|
|varchar content|
|+int from|
|+int to|
|date date?|

|f_friends|
|----------|
|*int id|
|+int from|
|+int to|
