import { ANSI } from "./utils/ansi.mjs";
import { print, clearScreen } from "./utils/io.mjs";
import SplashScreen from "./game/splash.mjs";
import { FIRST_PLAYER, SECOND_PLAYER } from "./consts.mjs";
import createMenu from "./utils/menu.mjs";
import createMapLayoutScreen from "./game/mapLayoutScreen.mjs";
import createInnBetweenScreen from "./game/innbetweenScreen.mjs";
import createBattleshipScreen from "./game/battleshipsScreen.mjs";
import { setLanguage, t } from "./utils/dictionary.mjs";

const GAME_FPS = 1000 / 60; // The theoretical refresh rate of our game engine
let currentState = null;    // The current active state in our finite-state machine.
let gameLoop = null;        // Variable that keeps a refrence to the interval id assigned to our game loop 
let mainMenuScene = null;

const MIN_WIDTH = 80;
const MIN_HEIGHT = 24;

function checkResolution() {
    const { columns, rows } = process.stdout;
    return columns >= MIN_WIDTH && rows >= MIN_HEIGHT
}

function promptResize() {
    clearScreen();
    console.log(t("resize_prompt"));

    process.stdin.once("", () => {
        if (!checkResolution()) {
            promptResize();
        } else {
            initializeMainMenu();
        }
    });
}

function languageSelectionMenu() {
    let menuItemCount = 0;
    return createMenu ([
        {
            text: "English", id: menuItemCount++, action: function () {
                setLanguage("en");
                initializeMainMenu();
            }
        }, 
        {
            text: "Norsk", id: menuItemCount++, action: function () {
                 setLanguage("no");
                 initializeMainMenu();
            }
        }
    ]);
}

function initializeMainMenu() {
    mainMenuScene = createMenu(buildMainMenu());
    SplashScreen.next = mainMenuScene;
    currentState = SplashScreen;
    gameLoop = setInterval(update, GAME_FPS);
}

(function initialize() {
    print(ANSI.HIDE_CURSOR);
    clearScreen();
   
    if (!checkResolution()) {
        promptResize();
    } else {
        currentState = languageSelectionMenu();
        gameLoop = setInterval(update, GAME_FPS);
    }
})();

function update() {
    currentState.update(GAME_FPS);
    currentState.draw(GAME_FPS);
    if (currentState.transitionTo != null) {
        currentState = currentState.next;
        print(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);
    }
}

// Suport / Utility functions ---------------------------------------------------------------

function buildMainMenu() {
    let menuItemCount = 0;
    return [
        {
            text: "Start Game", id: menuItemCount++, action: function () {
                clearScreen();
                let inBetween = createInnBetweenScreen();
                inBetween.init(`SHIP PLACEMENT\nFirst player get ready.\nPlayer two look away`, () => {

                    let p1map = createMapLayoutScreen();
                    p1map.init(FIRST_PLAYER, (player1ShipMap) => {


                        let inBetween = createInnBetweenScreen();
                        inBetween.init(`SHIP PLACEMENT\nSecond player get ready.\nPlayer one look away`, () => {
                            let p2map = createMapLayoutScreen();
                            p2map.init(SECOND_PLAYER, (player2ShipMap) => {
                                return createBattleshipScreen(player1ShipMap, player2ShipMap);
                            })
                            return p2map;
                        });
                        return inBetween;
                    });

                    return p1map;

                }, 3);
                currentState.next = inbetween;
                currentState.transitionTo = "Map layout";
            }
        },
        { text: "Exit Game", id: menuItemCount++, action: function () { print(ANSI.SHOW_CURSOR); clearScreen(); process.exit(); } },
    ];
}