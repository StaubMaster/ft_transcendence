# ft_transcendence
subject changed

# run ?

```
node Server/MultiService/Broker.js
```
wait a few seconds for it to start, then
```
node Server/JS/Session/SesPong.js
node Server/JS/main.js 
```

Right now only the Boker and Sessions are a seperate Service,
Performance feels slower, even with all logging turned off.
It should still work for everything else,
but the gameplay stuff needs to be transmitted faster.

Or maybe my code sucks. :(

# Controls
* W is Left Up
* S is Left Down
* O is Right Up
* L is Right Down

Left and Right only matters when playing against self, otherwise both work.

# Long Loading
Babylon has a lot of files that take a while do GET.
