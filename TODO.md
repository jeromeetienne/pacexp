
# FIXME: to have player control type linked to camera position
* if the camera is relative to player orientation, use guidedRelative
* else use guidedAbsolute
* user experience: the ui is natural. to go left on the screen, i press left arrow
  * so no issue here. it can be the default

# how to implement it ?

* notify the server everytime the camera change position
  * the tweening is ignored
  * current camera stage is the one use to determine the player control type
* cameraRender get a microevent.js emit "stageChange"
  * then send the new controlType to the server
  * message { type: 'ControlType' data: 'guidedRelative' }
  
# cleanup: many rotation, inversion everywhere
  * it makes coding real hard
  * playerCli rotation is multiplied by -1
  * the map is rotated many time
    * i want a simple display in source
    * not to compute 10 translations

# cleanup: impossible to stop a game
* in the client ?
* in the server ?
* so impossible to handle mutiple lives for players
* so impossible to do multiple map
  * so impossible to do the massively large pacman
  * http://worldbiggestpacman.com
* huge consquences
* to have a game with multiple lives and multiple levels is a MUST

## how to fix it ? how to proceed
* what is the issue


# cleanup: improve game configurability

* put options ion configSrv.js / configCli.js
* the ultimate goal is to be able to have a config file per game
  * or only a few classes
  * most of the engine being common to all games
  * at least the ones which are marble like


