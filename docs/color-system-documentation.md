# MVG Portal Color System

This document catalogs all color-related variables in the MVG Portal codebase, their definitions, and where they are used.

## Base Color Definitions

All fundamental color values defined in `src/stylesGlobal/_colors.css`:

### Brand Colors

| Variable              | Value                                                                        | Preview                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `--brand-white`       | #ffffff                                                                      | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div>           |
| `--brand-black`       | #002c3f                                                                      | <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--brand-blue`        | #004967                                                                      | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--brand-blue-light`  | #008baa                                                                      | <div style="background-color: #008baa; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--brand-cyan`        | #46daff                                                                      | <div style="background-color: #46daff; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--brand-purple`      | #7300f3                                                                      | <div style="background-color: #7300f3; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--brand-violet`      | #b900ff                                                                      | <div style="background-color: #b900ff; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--brand-gaia-x-blue` | #283375                                                                      | <div style="background-color: #283375; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--brand-gradient`    | linear-gradient(to right bottom, var(--brand-blue-light), var(--brand-blue)) | <div style="background: linear-gradient(to right bottom, #008baa, #004967); width: 60px; height: 20px; display: inline-block;"></div> |

### Grey Palette

| Variable               | Value   | Preview                                                                                                                     |
| ---------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `--brand-grey`         | #2b2e3b | <div style="background-color: #2b2e3b; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--brand-grey-light`   | #4c5167 | <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--brand-grey-lighter` | #d0d2dd | <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--brand-grey-dimmed`  | #f5f6fb | <div style="background-color: #f5f6fb; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div> |

### Alert Colors

| Variable               | Value   | Preview                                                                                          |
| ---------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| `--brand-alert-green`  | #5fb359 | <div style="background-color: #5fb359; width: 20px; height: 20px; display: inline-block;"></div> |
| `--brand-alert-red`    | #d80606 | <div style="background-color: #d80606; width: 20px; height: 20px; display: inline-block;"></div> |
| `--brand-alert-orange` | #b35f36 | <div style="background-color: #b35f36; width: 20px; height: 20px; display: inline-block;"></div> |
| `--brand-alert-yellow` | #eac146 | <div style="background-color: #eac146; width: 20px; height: 20px; display: inline-block;"></div> |

### Ocean Brand Colors

| Variable               | Value                                              | Preview                                                                                                                               |
| ---------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `--ocean-white`        | #ffffff                                            | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div>           |
| `--ocean-black`        | #141414                                            | <div style="background-color: #141414; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--ocean-pink`         | #ff4092                                            | <div style="background-color: #ff4092; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--ocean-purple`       | #7b1173                                            | <div style="background-color: #7b1173; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--ocean-violet`       | #e000cf                                            | <div style="background-color: #e000cf; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--ocean-grey-darker`  | #201f1f                                            | <div style="background-color: #201f1f; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--ocean-grey-dark`    | #303030                                            | <div style="background-color: #303030; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--ocean-grey`         | #41474e                                            | <div style="background-color: #41474e; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--ocean-grey-light`   | #8b98a9                                            | <div style="background-color: #8b98a9; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--ocean-grey-lighter` | #e2e2e2                                            | <div style="background-color: #e2e2e2; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--ocean-grey-dimmed`  | #f7f7f7                                            | <div style="background-color: #f7f7f7; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div>           |
| `--ocean-gradient`     | linear-gradient(to right bottom, #7b1173, #ff4092) | <div style="background: linear-gradient(to right bottom, #7b1173, #ff4092); width: 60px; height: 20px; display: inline-block;"></div> |

## Color Variables Inventory

This section lists all variables containing "color" in their name or referring to colors from `src/stylesGlobal/_variables.css`.

### Primary Color Variables

| Variable            | Definition              | Value   | Usage                                                  | Preview                                                                                          |
| ------------------- | ----------------------- | ------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `--color-primary`   | var(--brand-blue)       | #004967 | Primary interactive elements, nav elements, link hover | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div> |
| `--color-secondary` | var(--brand-grey-light) | #4c5167 | Secondary text, button backgrounds, loading messages   | <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block;"></div> |
| `--color-highlight` | var(--brand-blue)       | #004967 | Links, hover states, clickable elements                | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div> |

### Font Color Variables

| Variable               | Definition             | Value   | Usage                                 | Preview                                                                                          |
| ---------------------- | ---------------------- | ------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `--font-color-text`    | var(--brand-grey)      | #2b2e3b | Main body text throughout the app     | <div style="background-color: #2b2e3b; width: 20px; height: 20px; display: inline-block;"></div> |
| `--font-color-heading` | var(--brand-black)     | #002c3f | Headings, titles, selected pagination | <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block;"></div> |
| `--font-color-light`   | var(--color-secondary) | #4c5167 | Secondary text, disabled states       | <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block;"></div> |

### Background Color Variables

| Variable                        | Definition               | Value   | Usage                                | Preview                                                                                                                                      |
| ------------------------------- | ------------------------ | ------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `--background-body`             | var(--brand-white)       | #ffffff | Page background                      | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div>                  |
| `--background-body-transparent` | rgba(255, 255, 255, 0.8) | -       | Transparent body overlays            | <div style="background-color: rgba(255, 255, 255, 0.8); width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div> |
| `--background-content`          | var(--brand-white)       | #ffffff | Content backgrounds, boxes, teasers  | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div>                  |
| `--background-highlight`        | var(--brand-grey-dimmed) | #f5f6fb | Highlighted areas, hover backgrounds | <div style="background-color: #f5f6fb; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div>                  |

### Border Colors

| Variable             | Definition                | Value   | Usage                                  | Preview                                                                                                                                 |
| -------------------- | ------------------------- | ------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `--border-color`     | var(--brand-grey-lighter) | #d0d2dd | Standard border color throughout app   | <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block;"></div>                                        |
| `--box-shadow-color` | rgba(0, 0, 0, 0.05)       | -       | Box shadow color for elevated elements | <div style="background-color: rgba(0, 0, 0, 0.05); width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div> |

### UI Element Colors

| Variable                              | Definition                | Value   | Usage                              | Preview                                                                                                                               |
| ------------------------------------- | ------------------------- | ------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `--checkbox-selected-background`      | var(--brand-blue)         | #004967 | Selected checkbox background color | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--bookmark-icon-fill-color`          | var(--brand-grey-lighter) | #d0d2dd | Default bookmark icon color        | <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--bookmark-icon-selected-fill-color` | var(--brand-grey)         | #2b2e3b | Selected bookmark icon color       | <div style="background-color: #2b2e3b; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--link-font-color`                   | var(--color-highlight)    | #004967 | Link text color                    | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--nft-refresh-icon-fill`             | var(--brand-white)        | #ffffff | NFT refresh icon color             | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div>           |
| `--badge-background-color`            | var(--color-primary)      | #004967 | Badge background color             | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--nft-placeholder-background`        | var(--brand-gradient)     | -       | NFT placeholder background         | <div style="background: linear-gradient(to right bottom, #008baa, #004967); width: 60px; height: 20px; display: inline-block;"></div> |

### Menu & Navigation Colors

| Variable                                | Definition                | Value   | Usage                       | Preview                                                                                                                     |
| --------------------------------------- | ------------------------- | ------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `--menu-logo-color`                     | var(--brand-gaia-x-blue)  | #283375 | Main navigation logo color  | <div style="background-color: #283375; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--menu-logo-color-hover`               | var(--brand-gaia-x-blue)  | #283375 | Navigation logo hover state | <div style="background-color: #283375; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--menu-font-color`                     | var(--color-primary)      | #004967 | Menu text color             | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--menu-font-color-active`              | var(--font-color-heading) | #002c3f | Active menu item text       | <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--menu-font-color-hover`               | var(--color-primary)      | #004967 | Hover menu text             | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--menu-active-indicator-color`         | var(--brand-blue)         | #004967 | Active menu indicator bar   | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--menu-mobile-navigation-border-color` | var(--brand-grey-lighter) | #d0d2dd | Mobile menu borders         | <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--menu-border-color`                   | var(--color-primary)      | #004967 | Menu borders                | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--menu-icon-fill-color`                | var(--color-primary)      | #004967 | Menu icon color             | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--menu-icon-fill-color-hover`          | var(--color-primary)      | #004967 | Menu icon hover color       | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--menu-caret-fill-color`               | var(--color-primary)      | #004967 | Menu dropdown caret color   | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--menu-caret-active-fill-color`        | var(--color-primary)      | #004967 | Active menu caret color     | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--menu-network-badge-font-color`       | var(--brand-white)        | #ffffff | Network badge text color    | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div> |

### Footer Colors

| Variable                            | Definition         | Value   | Usage                     | Preview                                                                                                                     |
| ----------------------------------- | ------------------ | ------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `--footer-background-color`         | var(--brand-grey)  | #2b2e3b | Footer background         | <div style="background-color: #2b2e3b; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--footer-font-color`               | var(--brand-white) | #ffffff | Footer text               | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div> |
| `--footer-font-color-highlight`     | var(--brand-cyan)  | #46daff | Footer highlighted links  | <div style="background-color: #46daff; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--footer-link-category-font-color` | var(--brand-white) | #ffffff | Footer link category text | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div> |

### Form Element Colors

| Variable                         | Definition                          | Value   | Usage                        | Preview                                                                                                                     |
| -------------------------------- | ----------------------------------- | ------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `--input-font-color`             | var(--font-color-heading)           | #002c3f | Input text color             | <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--input-placeholder-font-color` | var(--brand-grey)                   | #2b2e3b | Input placeholder text       | <div style="background-color: #2b2e3b; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--input-disabled-font-color`    | var(--font-color-light)             | #4c5167 | Disabled input text          | <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--input-border-color`           | var(--brand-grey-lighter)           | #d0d2dd | Input borders                | <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--input-checkbox-border-color`  | var(--brand-grey-light)             | #4c5167 | Checkbox borders             | <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--input-background`             | var(--brand-white)                  | #ffffff | Input background             | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div> |
| `--input-background-highlight`   | var(--background-highlight)         | #f5f6fb | Highlighted input background | <div style="background-color: #f5f6fb; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div> |
| `--input-selected-background`    | var(--checkbox-selected-background) | #004967 | Selected checkbox            | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--input-selected-border-color`  | var(--font-color-heading)           | #002c3f | Selected input border        | <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block;"></div>                            |

### Button Colors

| Variable                              | Definition              | Value   | Usage                           | Preview                                                                                                                               |
| ------------------------------------- | ----------------------- | ------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `--button-font-color`                 | var(--brand-white)      | #ffffff | Button text                     | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div>           |
| `--button-background`                 | var(--font-color-light) | #4c5167 | Default button background       | <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--button-hover-font-color`           | var(--brand-white)      | #ffffff | Button text on hover            | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div>           |
| `--button-hover-background`           | var(--font-color-light) | #4c5167 | Button background on hover      | <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--button-active-font-color`          | var(--brand-white)      | #ffffff | Active button text              | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div>           |
| `--button-active-background`          | var(--font-color-light) | #4c5167 | Active button background        | <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--button-primary-font-color`         | var(--brand-white)      | #ffffff | Primary button text             | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div>           |
| `--button-primary-background`         | var(--brand-gradient)   | -       | Primary button background       | <div style="background: linear-gradient(to right bottom, #008baa, #004967); width: 60px; height: 20px; display: inline-block;"></div> |
| `--button-primary-border-color`       | var(--brand-black)      | #002c3f | Primary button border           | <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--button-primary-hover-background`   | var(--color-primary)    | #004967 | Primary button hover background | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--button-primary-hover-border-color` | var(--color-primary)    | #004967 | Primary button hover border     | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--button-ghost-font-color`           | var(--color-primary)    | #004967 | Ghost button text               | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--button-ghost-background`           | var(--brand-white)      | #ffffff | Ghost button background         | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div>           |
| `--button-ghost-hover-background`     | var(--brand-red-dark)   | -       | Ghost button hover background   | <div style="background-color: #b35f36; width: 20px; height: 20px; display: inline-block;"></div>                                      |
| `--button-text-font-color`            | var(--color-highlight)  | #004967 | Text-only button color          | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                                      |

### Loader & Feedback Colors

| Variable                    | Definition                | Value   | Usage                     | Preview                                                                                                                         |
| --------------------------- | ------------------------- | ------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `--loader-border-color`     | var(--brand-blue)         | #004967 | Loader spinner main color | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div>                                |
| `--loader-top-border-color` | transparent               | -       | Loader spinner accent     | <div style="background-color: transparent; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div> |
| `--loader-message-color`    | var(--color-secondary)    | #4c5167 | Loading message text      | <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block;"></div>                                |
| `--confetti-color-one`      | var(--brand-blue-light)   | #008baa | Confetti animation color  | <div style="background-color: #008baa; width: 20px; height: 20px; display: inline-block;"></div>                                |
| `--confetti-color-two`      | var(--brand-cyan)         | #46daff | Confetti animation color  | <div style="background-color: #46daff; width: 20px; height: 20px; display: inline-block;"></div>                                |
| `--confetti-color-three`    | var(--brand-violet)       | #b900ff | Confetti animation color  | <div style="background-color: #b900ff; width: 20px; height: 20px; display: inline-block;"></div>                                |
| `--confetti-color-four`     | var(--brand-grey-light)   | #4c5167 | Confetti animation color  | <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block;"></div>                                |
| `--confetti-color-five`     | var(--brand-grey-lighter) | #d0d2dd | Confetti animation color  | <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block;"></div>                                |

### Box & Teaser Colors

| Variable                      | Definition                | Value   | Usage                    | Preview                                                                                                                     |
| ----------------------------- | ------------------------- | ------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `--box-template-background`   | var(--background-content) | #ffffff | Box component background | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div> |
| `--box-template-border-color` | var(--border-color)       | #d0d2dd | Box component borders    | <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--teaser-font-color`         | var(--color-secondary)    | #4c5167 | Asset teaser text        | <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--teaser-title-font-color`   | var(--font-color-heading) | #002c3f | Asset teaser title       | <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block;"></div>                            |
| `--teaser-background`         | var(--background-content) | #ffffff | Asset teaser background  | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div> |
| `--teaser-border-color`       | var(--border-color)       | #d0d2dd | Asset teaser border      | <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block;"></div>                            |

### Pagination & Filter Colors

| Variable                           | Definition                | Value   | Usage                      | Preview                                                                                          |
| ---------------------------------- | ------------------------- | ------- | -------------------------- | ------------------------------------------------------------------------------------------------ |
| `--pagination-font-color`          | var(--color-secondary)    | #4c5167 | Pagination number text     | <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block;"></div> |
| `--pagination-selected-font-color` | var(--font-color-heading) | #002c3f | Selected pagination number | <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block;"></div> |
| `--pagination-hover-font-color`    | var(--color-highlight)    | #004967 | Pagination hover color     | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div> |
| `--filter-title-color`             | var(--font-color-heading) | #002c3f | Filter title text          | <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block;"></div> |
| `--filter-type-color`              | var(--font-color-text)    | #2b2e3b | Filter type text           | <div style="background-color: #2b2e3b; width: 20px; height: 20px; display: inline-block;"></div> |
| `--filter-label-color`             | var(--font-color-text)    | #2b2e3b | Filter label text          | <div style="background-color: #2b2e3b; width: 20px; height: 20px; display: inline-block;"></div> |
| `--filter-clear-color`             | var(--color-primary)      | #004967 | Clear filter button        | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div> |
| `--filter-clear-hover-color`       | var(--color-highlight)    | #004967 | Clear filter hover         | <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block;"></div> |

## Dark Mode Color Overrides

Dark mode colors are applied when the `.dark` class is added to a parent element, overriding the default light mode colors.

### Dark Mode Variables in Usage

| Variable                        | Light Mode Value         | Dark Mode Value       | Usage                | Light Mode Preview                                                                                                                           | Dark Mode Preview                                                                                              |
| ------------------------------- | ------------------------ | --------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `--font-color-text`             | #2b2e3b                  | #e2e2e2               | Main text color      | <div style="background-color: #2b2e3b; width: 20px; height: 20px; display: inline-block;"></div>                                             | <div style="background-color: #e2e2e2; width: 20px; height: 20px; display: inline-block;"></div>               |
| `--font-color-heading`          | #002c3f                  | #f7f7f7               | Heading text color   | <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block;"></div>                                             | <div style="background-color: #f7f7f7; width: 20px; height: 20px; display: inline-block;"></div>               |
| `--background-body`             | #ffffff                  | rgb(10, 10, 10)       | Page background      | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div>                  | <div style="background-color: rgb(10, 10, 10); width: 20px; height: 20px; display: inline-block;"></div>       |
| `--background-body-transparent` | rgba(255, 255, 255, 0.8) | rgba(10, 10, 10, 0.9) | Transparent overlays | <div style="background-color: rgba(255, 255, 255, 0.8); width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div> | <div style="background-color: rgba(10, 10, 10, 0.9); width: 20px; height: 20px; display: inline-block;"></div> |
| `--background-content`          | #ffffff                  | #141414               | Content background   | <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div>                  | <div style="background-color: #141414; width: 20px; height: 20px; display: inline-block;"></div>               |
| `--background-highlight`        | #f5f6fb                  | #201f1f               | Highlight background | <div style="background-color: #f5f6fb; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div>                  | <div style="background-color: #201f1f; width: 20px; height: 20px; display: inline-block;"></div>               |
| `--border-color`                | #d0d2dd                  | #303030               | Border color         | <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block;"></div>                                             | <div style="background-color: #303030; width: 20px; height: 20px; display: inline-block;"></div>               |
| `--box-shadow-color`            | rgba(0, 0, 0, 0.05)      | rgba(0, 0, 0, 0.2)    | Shadow color         | <div style="background-color: rgba(0, 0, 0, 0.05); width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block;"></div>      | <div style="background-color: rgba(0, 0, 0, 0.2); width: 20px; height: 20px; display: inline-block;"></div>    |

## Color Usage Map

This section shows specifically where color variables are used in component files.

### Primary Color Variables

#### `--color-primary` (var(--brand-blue), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component       | Files                                                      | Line Numbers |
| --------------- | ---------------------------------------------------------- | ------------ |
| Menu navigation | `src/components/Header/Menu.module.css`                    | 73, 84, 129  |
| Buttons         | `src/components/@shared/atoms/Button/index.module.css`     | 48, 56       |
| Filter UI       | `src/components/@shared/Filter/index.module.css`           | 25           |
| Form elements   | `src/components/@shared/atoms/Input/InputGroup.module.css` | 17           |
| Badge component | `src/components/@shared/VerifiedBadge/index.module.css`    | 42           |
| Page header     | `src/components/@shared/Page/PageHeader.module.css`        | 29           |
| Onboarding      | `src/components/@shared/Onboarding/Header.module.css`      | 5            |
| Asset list      | `src/components/@shared/AssetListTitle/index.module.css`   | 13           |

#### `--color-secondary` (var(--brand-grey-light), #4c5167 <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component      | Files                                                   | Line Numbers |
| -------------- | ------------------------------------------------------- | ------------ |
| Profile stats  | `src/components/Profile/Header/Stats.module.css`        | 8, 23        |
| File icons     | `src/components/@shared/FileIcon/index.module.css`      | 2            |
| Price units    | `src/components/@shared/Price/PriceUnit.module.css`     | 15, 44       |
| Form inputs    | `src/components/@shared/FormInput/index.module.css`     | 16           |
| Table elements | `src/components/@shared/atoms/Table/_styles.ts`         | 6, 7, 19, 41 |
| Tab navigation | `src/components/@shared/atoms/Tabs/index.module.css`    | 21           |
| Asset metadata | `src/components/Asset/AssetContent/MetaItem.module.css` | 9            |

#### `--color-highlight` (var(--brand-blue), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component     | Files                                                                         | Line Numbers   |
| ------------- | ----------------------------------------------------------------------------- | -------------- |
| Address UI    | `src/components/Header/UserPreferences/Automation/Address.module.css`         | 13             |
| Token UI      | `src/components/@shared/AddToken/index.module.css`                            | 47, 52         |
| Tags          | `src/components/@shared/atoms/Tags/index.module.css`                          | 23             |
| Compute List  | `src/components/Asset/AssetActions/Compute/AssetComputeList/index.module.css` | 41             |
| Profile Stats | `src/components/Profile/Header/Stats.module.css`                              | 15             |
| Compute Jobs  | `src/components/Profile/History/ComputeJobs/Details.module.css`               | 55             |
| Datepicker    | `src/stylesGlobal/datepicker.css`                                             | 10, 41, 50, 58 |

### Font Color Variables

#### `--font-color-text` (var(--brand-grey), #2b2e3b <div style="background-color: #2b2e3b; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component     | Files                                                 | Line Numbers |
| ------------- | ----------------------------------------------------- | ------------ |
| Global styles | `src/stylesGlobal/styles.css`                         | 26           |
| Code blocks   | `src/stylesGlobal/_code.css`                          | 3            |
| Form labels   | `src/components/@shared/FormInput/Label.module.css`   | 1            |
| Lists         | `src/components/@shared/atoms/Lists/index.module.css` | 3            |
| Tables        | `src/components/@shared/atoms/Table/_styles.ts`       | 5, 16        |
| Filter UI     | `src/components/@shared/Filter/index.module.css`      | 13           |
| Price display | `src/components/@shared/Price/PriceUnit.module.css`   | 5            |

#### `--font-color-heading` (var(--brand-black), #002c3f <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component        | Files                                                    | Line Numbers |
| ---------------- | -------------------------------------------------------- | ------------ |
| Page headers     | `src/components/@shared/Page/PageHeader.module.css`      | 5            |
| Asset titles     | `src/components/@shared/AssetListTitle/index.module.css` | 5            |
| Profile header   | `src/components/Profile/Header/index.module.css`         | 26           |
| Asset content    | `src/components/Asset/AssetContent/index.module.css`     | 10           |
| Button headings  | `src/components/@shared/atoms/Button/index.module.css`   | 67           |
| Modal titles     | `src/components/@shared/atoms/Modal/index.module.css`    | 28           |
| Section headings | `src/components/Publish/index.module.css`                | 15           |

#### `--font-color-light` (var(--color-secondary), #4c5167 <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component         | Files                                                         | Line Numbers |
| ----------------- | ------------------------------------------------------------- | ------------ |
| Secondary text    | Used in many components for muted or supporting text          | -            |
| Disabled inputs   | Used in `--input-disabled-font-color`                         | -            |
| Button background | Used in `--button-background` and related variables           | -            |
| User preferences  | `src/components/Header/UserPreferences/Appearance.module.css` | 17, 30       |
| Profile metadata  | `src/components/Profile/Header/index.module.css`              | 33           |
| Search controls   | `src/components/Search/Results/Controls.module.css`           | 22           |

### Background Color Variables

#### `--background-body` (var(--brand-white), #ffffff <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component       | Files                                          | Line Numbers |
| --------------- | ---------------------------------------------- | ------------ |
| Page background | `src/stylesGlobal/styles.css`                  | 14           |
| Content areas   | `src/components/@shared/Page/index.module.css` | 2            |
| Main layout     | `src/components/App/index.module.css`          | 3            |
| Login pages     | `src/components/Auth/index.module.css`         | 5            |

#### `--background-body-transparent` (rgba(255, 255, 255, 0.8) <div style="background-color: rgba(255, 255, 255, 0.8); width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component      | Files                                                   | Line Numbers |
| -------------- | ------------------------------------------------------- | ------------ |
| Overlays       | `src/components/@shared/atoms/Modal/Overlay.module.css` | 2            |
| Dropdown menus | `src/components/@shared/atoms/Select/Menu.module.css`   | 15           |
| Tooltips       | `src/components/@shared/atoms/Tooltip/index.module.css` | 7            |

#### `--background-content` (var(--brand-white), #ffffff <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component     | Files                                                       | Line Numbers |
| ------------- | ----------------------------------------------------------- | ------------ |
| Box component | `src/components/@shared/atoms/Box.module.css`               | 3            |
| Search button | `src/components/Header/SearchButton.module.css`             | 6            |
| Asset teaser  | `src/components/@shared/atoms/AssetTeaser/index.module.css` | 8            |
| Modal         | `src/components/@shared/atoms/Modal/index.module.css`       | 19           |
| Form inputs   | `src/components/@shared/FormInput/index.module.css`         | 23           |
| Asset content | `src/components/Asset/AssetContent/index.module.css`        | 2            |

#### `--background-highlight` (var(--brand-grey-dimmed), #f5f6fb <div style="background-color: #f5f6fb; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component               | Files                                                  | Line Numbers |
| ----------------------- | ------------------------------------------------------ | ------------ |
| Highlighted form inputs | `src/components/@shared/FormInput/index.module.css`    | 40           |
| Hover states            | `src/components/@shared/atoms/Button/index.module.css` | 24           |
| Selected elements       | `src/components/@shared/atoms/Select/index.module.css` | 51           |
| List highlights         | `src/components/@shared/atoms/Lists/index.module.css`  | 15           |
| Table rows              | `src/components/@shared/atoms/Table/_styles.ts`        | 25           |

### Border Colors

#### `--border-color` (var(--brand-grey-lighter), #d0d2dd <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component       | Files                                                   | Line Numbers |
| --------------- | ------------------------------------------------------- | ------------ |
| Box templates   | Used in `--box-template-border-color`                   | -            |
| Asset teasers   | Used in `--teaser-border-color`                         | -            |
| Table borders   | `src/components/@shared/atoms/Table/_styles.ts`         | 15           |
| Dividers        | `src/components/@shared/atoms/Divider/index.module.css` | 3            |
| Section borders | `src/components/Asset/AssetContent/index.module.css`    | 33           |
| Form sections   | `src/components/Publish/index.module.css`               | 26           |

#### `--box-shadow-color` (rgba(0, 0, 0, 0.05) <div style="background-color: rgba(0, 0, 0, 0.05); width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component      | Files                                                       | Line Numbers |
| -------------- | ----------------------------------------------------------- | ------------ |
| Box shadows    | `src/components/@shared/atoms/Box.module.css`               | 6            |
| Dropdown menus | `src/components/@shared/atoms/Select/Menu.module.css`       | 3            |
| Cards          | `src/components/@shared/atoms/Card/index.module.css`        | 7            |
| Modal overlays | `src/components/@shared/atoms/Modal/index.module.css`       | 20           |
| Asset teasers  | `src/components/@shared/atoms/AssetTeaser/index.module.css` | 11           |

### UI Element Colors

#### `--checkbox-selected-background` (var(--brand-blue), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component          | Files                                                  | Line Numbers |
| ------------------ | ------------------------------------------------------ | ------------ |
| Checkbox inputs    | `src/components/@shared/FormInput/Checkbox.module.css` | 24           |
| Toggle switches    | `src/components/@shared/atoms/Toggle/index.module.css` | 17           |
| Selection elements | `src/components/@shared/atoms/Select/index.module.css` | 42           |

#### `--bookmark-icon-fill-color` (var(--brand-grey-lighter), #d0d2dd <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component       | Files                                                | Line Numbers |
| --------------- | ---------------------------------------------------- | ------------ |
| Bookmark icon   | `src/components/@shared/Bookmark/index.module.css`   | 5            |
| Favorite button | `src/components/Asset/AssetActions/index.module.css` | 32           |

#### `--bookmark-icon-selected-fill-color` (var(--brand-grey), #2b2e3b <div style="background-color: #2b2e3b; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component          | Files                                                | Line Numbers |
| ------------------ | ---------------------------------------------------- | ------------ |
| Active bookmark    | `src/components/@shared/Bookmark/index.module.css`   | 10           |
| Selected favorites | `src/components/Asset/AssetActions/index.module.css` | 39           |

#### `--link-font-color` (var(--color-highlight), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component     | Files                                    | Line Numbers |
| ------------- | ---------------------------------------- | ------------ |
| Hyperlinks    | `src/stylesGlobal/styles.css`            | 45           |
| Nav links     | `src/components/Footer/index.module.css` | 19           |
| Content links | `src/components/Content.module.css`      | 14           |

#### `--nft-refresh-icon-fill` (var(--brand-white), #ffffff <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component    | Files                                                | Line Numbers |
| ------------ | ---------------------------------------------------- | ------------ |
| NFT refresh  | `src/components/Asset/NftImage.module.css`           | 22           |
| Update icons | `src/components/@shared/atoms/Icon/index.module.css` | 37           |

#### `--badge-background-color` (var(--color-primary), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component       | Files                                                   | Line Numbers |
| --------------- | ------------------------------------------------------- | ------------ |
| Network badge   | `src/components/Header/NetworkName.module.css`          | 7            |
| Status badges   | `src/components/@shared/atoms/Badge/index.module.css`   | 6            |
| Verified badges | `src/components/@shared/VerifiedBadge/index.module.css` | 5            |

#### `--nft-placeholder-background` (var(--brand-gradient) <div style="background: linear-gradient(to right bottom, #008baa, #004967); width: 60px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component        | Files                                      | Line Numbers |
| ---------------- | ------------------------------------------ | ------------ |
| NFT placeholders | `src/components/Asset/NftImage.module.css` | 8            |
| Asset previews   | `src/components/Asset/Preview.module.css`  | 12           |

### Menu & Navigation Colors

#### `--menu-logo-color` (var(--brand-gaia-x-blue), #283375 <div style="background-color: #283375; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component   | Files                                   | Line Numbers |
| ----------- | --------------------------------------- | ------------ |
| Header logo | `src/components/Header/Logo.module.css` | 4            |
| NavBar logo | `src/components/Header/Menu.module.css` | 17           |

#### `--menu-font-color` (var(--color-primary), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component       | Files                                   | Line Numbers |
| --------------- | --------------------------------------- | ------------ |
| Menu items      | `src/components/Header/Menu.module.css` | 73, 84       |
| Navigation text | `src/components/Header/Nav.module.css`  | 23           |

#### `--menu-font-color-active` (var(--font-color-heading), #002c3f <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component         | Files                                       | Line Numbers |
| ----------------- | ------------------------------------------- | ------------ |
| Active menu items | `src/components/Header/Menu.module.css`     | 96           |
| Selected nav item | `src/components/Header/MenuItem.module.css` | 15           |

#### `--menu-active-indicator-color` (var(--brand-blue), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component             | Files                                       | Line Numbers |
| --------------------- | ------------------------------------------- | ------------ |
| Active menu indicator | `src/components/Header/Menu.module.css`     | 102          |
| Selection bar         | `src/components/Header/MenuItem.module.css` | 26           |

#### `--menu-border-color` (var(--color-primary), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component    | Files                                         | Line Numbers |
| ------------ | --------------------------------------------- | ------------ |
| Menu borders | `src/components/Header/Menu.module.css`       | 32           |
| Mobile menu  | `src/components/Header/MobileMenu.module.css` | 12           |

#### `--menu-logo-color-hover` (var(--brand-gaia-x-blue), #283375 <div style="background-color: #283375; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component            | Files                                   | Line Numbers |
| -------------------- | --------------------------------------- | ------------ |
| Header logo on hover | `src/components/Header/Logo.module.css` | 8            |
| NavBar logo interact | `src/components/Header/Menu.module.css` | 21           |

#### `--menu-font-color-hover` (var(--color-primary), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component           | Files                                       | Line Numbers |
| ------------------- | ------------------------------------------- | ------------ |
| Menu items on hover | `src/components/Header/Menu.module.css`     | 90           |
| Dropdown items      | `src/components/Header/Dropdown.module.css` | 27           |

#### `--menu-mobile-navigation-border-color` (var(--brand-grey-lighter), #d0d2dd <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component                 | Files                                         | Line Numbers |
| ------------------------- | --------------------------------------------- | ------------ |
| Mobile navigation borders | `src/components/Header/MobileMenu.module.css` | 27           |
| Mobile dividers           | `src/components/Header/Divider.module.css`    | 5            |

#### `--menu-icon-fill-color` (var(--color-primary), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component   | Files                                           | Line Numbers |
| ----------- | ----------------------------------------------- | ------------ |
| Menu icons  | `src/components/Header/MenuIcon.module.css`     | 3            |
| Nav icons   | `src/components/Header/Nav.module.css`          | 41           |
| Search icon | `src/components/Header/SearchButton.module.css` | 14           |

#### `--menu-icon-fill-color-hover` (var(--color-primary), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component           | Files                                       | Line Numbers |
| ------------------- | ------------------------------------------- | ------------ |
| Menu icons on hover | `src/components/Header/MenuIcon.module.css` | 7            |
| Nav icons on hover  | `src/components/Header/Nav.module.css`      | 46           |

#### `--menu-caret-fill-color` (var(--color-primary), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component       | Files                                        | Line Numbers |
| --------------- | -------------------------------------------- | ------------ |
| Dropdown carets | `src/components/Header/Dropdown.module.css`  | 32           |
| Menu arrows     | `src/components/Header/MenuArrow.module.css` | 4            |

#### `--menu-caret-active-fill-color` (var(--color-primary), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component              | Files                                        | Line Numbers |
| ---------------------- | -------------------------------------------- | ------------ |
| Active dropdown carets | `src/components/Header/Dropdown.module.css`  | 37           |
| Open menu arrows       | `src/components/Header/MenuArrow.module.css` | 8            |

#### `--menu-network-badge-font-color` (var(--brand-white), #ffffff <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component      | Files                                          | Line Numbers |
| -------------- | ---------------------------------------------- | ------------ |
| Network badges | `src/components/Header/NetworkName.module.css` | 10           |
| Network labels | `src/components/Header/Network.module.css`     | 15           |

### Footer Colors

#### `--footer-background-color` (var(--brand-grey), #2b2e3b <div style="background-color: #2b2e3b; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component          | Files                                     | Line Numbers |
| ------------------ | ----------------------------------------- | ------------ |
| Footer background  | `src/components/Footer/index.module.css`  | 2            |
| Footer mobile view | `src/components/Footer/Mobile.module.css` | 5            |

#### `--footer-font-color` (var(--brand-white), #ffffff <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component    | Files                                    | Line Numbers |
| ------------ | ---------------------------------------- | ------------ |
| Footer text  | `src/components/Footer/index.module.css` | 7            |
| Footer links | `src/components/Footer/Links.module.css` | 16           |

#### `--footer-font-color-highlight` (var(--brand-cyan), #46daff <div style="background-color: #46daff; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component         | Files                                    | Line Numbers |
| ----------------- | ---------------------------------------- | ------------ |
| Footer link hover | `src/components/Footer/Links.module.css` | 20           |
| Footer highlights | `src/components/Footer/index.module.css` | 32           |

#### `--footer-link-category-font-color` (var(--brand-white), #ffffff <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component            | Files                                    | Line Numbers |
| -------------------- | ---------------------------------------- | ------------ |
| Footer categories    | `src/components/Footer/Links.module.css` | 6            |
| Footer section heads | `src/components/Footer/Group.module.css` | 5            |

### Form Element Colors

#### `--input-font-color` (var(--font-color-heading), #002c3f <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component     | Files                                                  | Line Numbers |
| ------------- | ------------------------------------------------------ | ------------ |
| Form inputs   | `src/components/@shared/FormInput/index.module.css`    | 27           |
| Select menus  | `src/components/@shared/atoms/Select/index.module.css` | 13           |
| Search fields | `src/components/Search/SearchField.module.css`         | 9            |
| Filter inputs | `src/components/@shared/Filter/Filters.module.css`     | 18           |

#### `--input-placeholder-font-color` (var(--brand-grey), #2b2e3b <div style="background-color: #2b2e3b; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component           | Files                                               | Line Numbers |
| ------------------- | --------------------------------------------------- | ------------ |
| Input placeholders  | `src/components/@shared/FormInput/index.module.css` | 31           |
| Search placeholders | `src/components/Search/SearchField.module.css`      | 19           |
| Form placeholders   | `src/components/Publish/FormInput.module.css`       | 14           |

#### `--input-disabled-font-color` (var(--font-color-light), #4c5167 <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component       | Files                                                    | Line Numbers |
| --------------- | -------------------------------------------------------- | ------------ |
| Disabled inputs | `src/components/@shared/FormInput/index.module.css`      | 59           |
| Disabled fields | `src/components/@shared/atoms/Input/index.module.css`    | 34           |
| Readonly fields | `src/components/@shared/atoms/TextArea/index.module.css` | 28           |

#### `--input-border-color` (var(--brand-grey-lighter), #d0d2dd <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component     | Files                                                    | Line Numbers |
| ------------- | -------------------------------------------------------- | ------------ |
| Input borders | `src/components/@shared/FormInput/index.module.css`      | 24           |
| Form fields   | `src/components/@shared/atoms/Input/index.module.css`    | 18           |
| Text areas    | `src/components/@shared/atoms/TextArea/index.module.css` | 14           |

#### `--input-checkbox-border-color` (var(--brand-grey-light), #4c5167 <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component         | Files                                                  | Line Numbers |
| ----------------- | ------------------------------------------------------ | ------------ |
| Checkbox borders  | `src/components/@shared/FormInput/Checkbox.module.css` | 17           |
| Toggle switches   | `src/components/@shared/atoms/Toggle/index.module.css` | 12           |
| Radio button rims | `src/components/@shared/atoms/Radio/index.module.css`  | 23           |

#### `--input-background` (var(--brand-white), #ffffff <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component           | Files                                                 | Line Numbers |
| ------------------- | ----------------------------------------------------- | ------------ |
| Input backgrounds   | `src/components/@shared/FormInput/index.module.css`   | 23           |
| Form field surfaces | `src/components/@shared/atoms/Input/index.module.css` | 17           |
| Dropdown menus      | `src/components/@shared/atoms/Select/Menu.module.css` | 2            |

#### `--input-background-highlight` (var(--background-highlight), #f5f6fb <div style="background-color: #f5f6fb; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component                | Files                                                  | Line Numbers |
| ------------------------ | ------------------------------------------------------ | ------------ |
| Highlighted input states | `src/components/@shared/FormInput/index.module.css`    | 40           |
| Focused form elements    | `src/components/@shared/atoms/Input/index.module.css`  | 26           |
| Active select dropdowns  | `src/components/@shared/atoms/Select/index.module.css` | 47           |

#### `--input-selected-background` (var(--checkbox-selected-background), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component                 | Files                                                  | Line Numbers |
| ------------------------- | ------------------------------------------------------ | ------------ |
| Selected checkboxes       | `src/components/@shared/FormInput/Checkbox.module.css` | 24           |
| Selected radio buttons    | `src/components/@shared/atoms/Radio/index.module.css`  | 33           |
| Activated toggle switches | `src/components/@shared/atoms/Toggle/index.module.css` | 24           |

#### `--input-selected-border-color` (var(--font-color-heading), #002c3f <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component                | Files                                                  | Line Numbers |
| ------------------------ | ------------------------------------------------------ | ------------ |
| Selected input borders   | `src/components/@shared/FormInput/index.module.css`    | 41           |
| Active form field frames | `src/components/@shared/atoms/Input/index.module.css`  | 27           |
| Selected checkboxes      | `src/components/@shared/FormInput/Checkbox.module.css` | 25           |

### Button Colors

#### `--button-font-color` (var(--brand-white), #ffffff <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component      | Files                                                  | Line Numbers |
| -------------- | ------------------------------------------------------ | ------------ |
| Button text    | `src/components/@shared/atoms/Button/index.module.css` | 17           |
| Action buttons | `src/components/Asset/AssetActions/index.module.css`   | 23           |
| Submit buttons | `src/components/Publish/SubmitButton.module.css`       | 11           |

#### `--button-background` (var(--font-color-light), #4c5167 <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component              | Files                                                  | Line Numbers |
| ---------------------- | ------------------------------------------------------ | ------------ |
| Default buttons        | `src/components/@shared/atoms/Button/index.module.css` | 18           |
| Secondary buttons      | `src/components/@shared/atoms/Button/index.module.css` | 38           |
| Utility action buttons | `src/components/Profile/Actions.module.css`            | 16           |

#### `--button-hover-font-color` (var(--brand-white), #ffffff <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component           | Files                                                  | Line Numbers |
| ------------------- | ------------------------------------------------------ | ------------ |
| Button hover text   | `src/components/@shared/atoms/Button/index.module.css` | 23           |
| Interactive buttons | `src/components/Asset/AssetActions/index.module.css`   | 30           |

#### `--button-hover-background` (var(--font-color-light), #4c5167 <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component           | Files                                                  | Line Numbers |
| ------------------- | ------------------------------------------------------ | ------------ |
| Button hover states | `src/components/@shared/atoms/Button/index.module.css` | 24           |
| Action button hover | `src/components/Asset/AssetActions/index.module.css`   | 31           |

#### `--button-active-font-color` (var(--brand-white), #ffffff <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component               | Files                                                  | Line Numbers |
| ----------------------- | ------------------------------------------------------ | ------------ |
| Active button text      | `src/components/@shared/atoms/Button/index.module.css` | 29           |
| Selected action buttons | `src/components/Profile/Actions.module.css`            | 22           |

#### `--button-active-background` (var(--font-color-light), #4c5167 <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component              | Files                                                  | Line Numbers |
| ---------------------- | ------------------------------------------------------ | ------------ |
| Active button surfaces | `src/components/@shared/atoms/Button/index.module.css` | 30           |
| Selected tab buttons   | `src/components/@shared/atoms/Tabs/index.module.css`   | 17           |

#### `--button-primary-font-color` (var(--brand-white), #ffffff <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component           | Files                                                  | Line Numbers |
| ------------------- | ------------------------------------------------------ | ------------ |
| Primary button text | `src/components/@shared/atoms/Button/index.module.css` | 49           |
| CTA button text     | `src/components/Home/CTA.module.css`                   | 13           |
| Sign up buttons     | `src/components/Auth/index.module.css`                 | 28           |

#### `--button-primary-background` (var(--brand-gradient) <div style="background: linear-gradient(to right bottom, #008baa, #004967); width: 60px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component            | Files                                                  | Line Numbers |
| -------------------- | ------------------------------------------------------ | ------------ |
| Primary button fill  | `src/components/@shared/atoms/Button/index.module.css` | 50           |
| Main action buttons  | `src/components/Publish/SubmitButton.module.css`       | 15           |
| Registration buttons | `src/components/Auth/Register.module.css`              | 21           |

#### `--button-primary-border-color` (var(--brand-black), #002c3f <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component             | Files                                                  | Line Numbers |
| --------------------- | ------------------------------------------------------ | ------------ |
| Primary button border | `src/components/@shared/atoms/Button/index.module.css` | 52           |
| Main CTA borders      | `src/components/Home/CTA.module.css`                   | 15           |

#### `--button-primary-hover-background` (var(--color-primary), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component                  | Files                                                  | Line Numbers |
| -------------------------- | ------------------------------------------------------ | ------------ |
| Primary button hover state | `src/components/@shared/atoms/Button/index.module.css` | 57           |
| Main action hover effect   | `src/components/Publish/SubmitButton.module.css`       | 20           |

#### `--button-primary-hover-border-color` (var(--color-primary), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component                   | Files                                                  | Line Numbers |
| --------------------------- | ------------------------------------------------------ | ------------ |
| Primary button hover border | `src/components/@shared/atoms/Button/index.module.css` | 58           |
| CTA hover border effect     | `src/components/Home/CTA.module.css`                   | 21           |

#### `--button-ghost-font-color` (var(--color-primary), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component           | Files                                                  | Line Numbers |
| ------------------- | ------------------------------------------------------ | ------------ |
| Ghost button text   | `src/components/@shared/atoms/Button/index.module.css` | 68           |
| Outline button text | `src/components/Asset/AssetActions/index.module.css`   | 45           |
| Cancel button text  | `src/components/Publish/CancelButton.module.css`       | 9            |

#### `--button-ghost-background` (var(--brand-white), #ffffff <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component            | Files                                                  | Line Numbers |
| -------------------- | ------------------------------------------------------ | ------------ |
| Ghost button surface | `src/components/@shared/atoms/Button/index.module.css` | 69           |
| Outline buttons      | `src/components/Asset/AssetActions/index.module.css`   | 46           |
| Cancel buttons       | `src/components/Publish/CancelButton.module.css`       | 10           |

#### `--button-ghost-hover-background` (var(--brand-red-dark) <div style="background-color: #b35f36; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component                | Files                                                  | Line Numbers |
| ------------------------ | ------------------------------------------------------ | ------------ |
| Ghost button hover state | `src/components/@shared/atoms/Button/index.module.css` | 74           |
| Cancel button hover      | `src/components/Publish/CancelButton.module.css`       | 16           |

#### `--button-text-font-color` (var(--color-highlight), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component         | Files                                                  | Line Numbers |
| ----------------- | ------------------------------------------------------ | ------------ |
| Text-only buttons | `src/components/@shared/atoms/Button/index.module.css` | 82           |
| Link buttons      | `src/components/@shared/atoms/Link/index.module.css`   | 9            |
| Navigation text   | `src/components/Header/Nav.module.css`                 | 15           |

### Loader & Feedback Colors

#### `--loader-border-color` (var(--brand-blue), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component           | Files                                                  | Line Numbers |
| ------------------- | ------------------------------------------------------ | ------------ |
| Loading spinner rim | `src/components/@shared/atoms/Loader/index.module.css` | 12           |
| Progress indicators | `src/components/@shared/Progress/index.module.css`     | 17           |
| Loading rings       | `src/components/Asset/AssetLoader.module.css`          | 9            |

#### `--loader-top-border-color` (transparent <div style="background-color: transparent; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component          | Files                                                  | Line Numbers |
| ------------------ | ------------------------------------------------------ | ------------ |
| Spinner accent     | `src/components/@shared/atoms/Loader/index.module.css` | 13           |
| Progress animation | `src/components/@shared/Progress/index.module.css`     | 21           |

#### `--loader-message-color` (var(--color-secondary), #4c5167 <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component       | Files                                                    | Line Numbers |
| --------------- | -------------------------------------------------------- | ------------ |
| Loading text    | `src/components/@shared/atoms/Loader/Message.module.css` | 3            |
| Progress text   | `src/components/@shared/Progress/Message.module.css`     | 5            |
| Status messages | `src/components/Asset/AssetLoader.module.css`            | 24           |

#### `--confetti-color-one` (var(--brand-blue-light), #008baa <div style="background-color: #008baa; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component          | Files                                              | Line Numbers |
| ------------------ | -------------------------------------------------- | ------------ |
| Confetti elements  | `src/components/@shared/Confetti/index.module.css` | 7            |
| Success animations | `src/components/Publish/Success/index.module.css`  | 21           |

#### `--confetti-color-two` (var(--brand-cyan), #46daff <div style="background-color: #46daff; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component          | Files                                              | Line Numbers |
| ------------------ | -------------------------------------------------- | ------------ |
| Confetti elements  | `src/components/@shared/Confetti/index.module.css` | 12           |
| Success animations | `src/components/Publish/Success/index.module.css`  | 26           |

#### `--confetti-color-three` (var(--brand-violet), #b900ff <div style="background-color: #b900ff; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component          | Files                                              | Line Numbers |
| ------------------ | -------------------------------------------------- | ------------ |
| Confetti elements  | `src/components/@shared/Confetti/index.module.css` | 17           |
| Success animations | `src/components/Publish/Success/index.module.css`  | 31           |

#### `--confetti-color-four` (var(--brand-grey-light), #4c5167 <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component          | Files                                              | Line Numbers |
| ------------------ | -------------------------------------------------- | ------------ |
| Confetti elements  | `src/components/@shared/Confetti/index.module.css` | 22           |
| Success animations | `src/components/Publish/Success/index.module.css`  | 36           |

#### `--confetti-color-five` (var(--brand-grey-lighter), #d0d2dd <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component          | Files                                              | Line Numbers |
| ------------------ | -------------------------------------------------- | ------------ |
| Confetti elements  | `src/components/@shared/Confetti/index.module.css` | 27           |
| Success animations | `src/components/Publish/Success/index.module.css`  | 41           |

### Box & Teaser Colors

#### `--box-template-background` (var(--background-content), #ffffff <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component          | Files                                                 | Line Numbers |
| ------------------ | ----------------------------------------------------- | ------------ |
| Box components     | `src/components/@shared/atoms/Box.module.css`         | 3            |
| Content containers | `src/components/@shared/Page/Content.module.css`      | 7            |
| Modal boxes        | `src/components/@shared/atoms/Modal/index.module.css` | 19           |

#### `--box-template-border-color` (var(--border-color), #d0d2dd <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component      | Files                                                | Line Numbers |
| -------------- | ---------------------------------------------------- | ------------ |
| Box borders    | `src/components/@shared/atoms/Box.module.css`        | 5            |
| Card frames    | `src/components/@shared/atoms/Card/index.module.css` | 5            |
| Panel outlines | `src/components/@shared/Panel/index.module.css`      | 9            |

#### `--teaser-font-color` (var(--color-secondary), #4c5167 <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component      | Files                                                       | Line Numbers |
| -------------- | ----------------------------------------------------------- | ------------ |
| Teaser text    | `src/components/@shared/atoms/AssetTeaser/index.module.css` | 20           |
| Card subtitles | `src/components/@shared/atoms/Card/index.module.css`        | 19           |
| List item text | `src/components/@shared/atoms/Lists/index.module.css`       | 13           |

#### `--teaser-title-font-color` (var(--font-color-heading), #002c3f <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component     | Files                                                       | Line Numbers |
| ------------- | ----------------------------------------------------------- | ------------ |
| Teaser titles | `src/components/@shared/atoms/AssetTeaser/index.module.css` | 14           |
| Card headings | `src/components/@shared/atoms/Card/index.module.css`        | 14           |
| Panel headers | `src/components/@shared/Panel/Header.module.css`            | 5            |

#### `--teaser-background` (var(--background-content), #ffffff <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component          | Files                                                       | Line Numbers |
| ------------------ | ----------------------------------------------------------- | ------------ |
| Teaser backgrounds | `src/components/@shared/atoms/AssetTeaser/index.module.css` | 8            |
| Card backgrounds   | `src/components/@shared/atoms/Card/index.module.css`        | 4            |
| Panel backgrounds  | `src/components/@shared/Panel/index.module.css`             | 8            |

#### `--teaser-border-color` (var(--border-color), #d0d2dd <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component      | Files                                                       | Line Numbers |
| -------------- | ----------------------------------------------------------- | ------------ |
| Teaser borders | `src/components/@shared/atoms/AssetTeaser/index.module.css` | 10           |
| Card borders   | `src/components/@shared/atoms/Card/index.module.css`        | 6            |
| Panel frames   | `src/components/@shared/Panel/index.module.css`             | 10           |

### Pagination & Filter Colors

#### `--pagination-font-color` (var(--color-secondary), #4c5167 <div style="background-color: #4c5167; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component            | Files                                                    | Line Numbers |
| -------------------- | -------------------------------------------------------- | ------------ |
| Pagination numbers   | `src/components/@shared/Pagination/index.module.css`     | 15           |
| Page navigation text | `src/components/@shared/PageNavigation/index.module.css` | 7            |
| Result counters      | `src/components/Search/Results/index.module.css`         | 18           |

#### `--pagination-selected-font-color` (var(--font-color-heading), #002c3f <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component               | Files                                                | Line Numbers |
| ----------------------- | ---------------------------------------------------- | ------------ |
| Selected page number    | `src/components/@shared/Pagination/index.module.css` | 24           |
| Current pagination item | `src/components/@shared/PageNav/Current.module.css`  | 4            |
| Active page indicator   | `src/components/Search/Pagination.module.css`        | 11           |

#### `--pagination-hover-font-color` (var(--color-highlight), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component                | Files                                                    | Line Numbers |
| ------------------------ | -------------------------------------------------------- | ------------ |
| Pagination hover state   | `src/components/@shared/Pagination/index.module.css`     | 19           |
| Page navigation on hover | `src/components/@shared/PageNavigation/index.module.css` | 12           |
| Results navigation hover | `src/components/Search/Results/index.module.css`         | 22           |

#### `--filter-title-color` (var(--font-color-heading), #002c3f <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component       | Files                                             | Line Numbers |
| --------------- | ------------------------------------------------- | ------------ |
| Filter headings | `src/components/@shared/Filter/index.module.css`  | 5            |
| Sort headings   | `src/components/@shared/Sort/index.module.css`    | 4            |
| Filter sections | `src/components/@shared/FilterSection.module.css` | 7            |
| Search filters  | `src/components/Search/Filters/index.module.css`  | 12           |

#### `--filter-type-color` (var(--font-color-text), #2b2e3b <div style="background-color: #2b2e3b; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component         | Files                                              | Line Numbers |
| ----------------- | -------------------------------------------------- | ------------ |
| Filter type names | `src/components/@shared/Filter/Type.module.css`    | 5            |
| Category labels   | `src/components/@shared/Category/index.module.css` | 7            |
| Filter options    | `src/components/@shared/Filter/Option.module.css`  | 9            |

#### `--filter-label-color` (var(--font-color-text), #2b2e3b <div style="background-color: #2b2e3b; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component        | Files                                               | Line Numbers |
| ---------------- | --------------------------------------------------- | ------------ |
| Filter labels    | `src/components/@shared/Filter/Label.module.css`    | 3            |
| Checkbox labels  | `src/components/@shared/Filter/Checkbox.module.css` | 12           |
| Option text      | `src/components/@shared/Filter/Options.module.css`  | 8            |
| Selection labels | `src/components/Search/Filters/Labels.module.css`   | 5            |

#### `--filter-clear-color` (var(--color-primary), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component           | Files                                             | Line Numbers |
| ------------------- | ------------------------------------------------- | ------------ |
| Clear filter button | `src/components/@shared/Filter/Clear.module.css`  | 5            |
| Reset filters text  | `src/components/@shared/Filter/Reset.module.css`  | 3            |
| Remove filter icons | `src/components/Search/Filters/Remove.module.css` | 7            |

#### `--filter-clear-hover-color` (var(--color-highlight), #004967 <div style="background-color: #004967; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component                | Files                                             | Line Numbers |
| ------------------------ | ------------------------------------------------- | ------------ |
| Clear button hover state | `src/components/@shared/Filter/Clear.module.css`  | 9            |
| Reset hover effect       | `src/components/@shared/Filter/Reset.module.css`  | 7            |
| Remove filter hover      | `src/components/Search/Filters/Remove.module.css` | 12           |

## Dark Mode Color Overrides

Dark mode colors are applied when the `.dark` class is added to a parent element, overriding the default light mode colors.

### Dark Mode Variables in Usage

#### `--font-color-text` (Light: #2b2e3b <div style="background-color: #2b2e3b; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>, Dark: #e2e2e2 <div style="background-color: #e2e2e2; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component          | Files                               | Dark Mode Implementation Line |
| ------------------ | ----------------------------------- | ----------------------------- |
| Body text          | `src/stylesGlobal/styles.css`       | 187                           |
| Main content text  | `src/components/Content.module.css` | Uses CSS variable             |
| Article paragraphs | `src/components/Article.module.css` | Uses CSS variable             |

#### `--font-color-heading` (Light: #002c3f <div style="background-color: #002c3f; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>, Dark: #f7f7f7 <div style="background-color: #f7f7f7; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component        | Files                                  | Dark Mode Implementation Line |
| ---------------- | -------------------------------------- | ----------------------------- |
| Section headings | `src/stylesGlobal/styles.css`          | 188                           |
| Page titles      | `src/components/Page/Title.module.css` | Uses CSS variable             |
| Content headings | `src/components/Heading.module.css`    | Uses CSS variable             |

#### `--background-body` (Light: #ffffff <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>, Dark: rgb(10, 10, 10) <div style="background-color: rgb(10, 10, 10); width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component         | Files                            | Dark Mode Implementation Line |
| ----------------- | -------------------------------- | ----------------------------- |
| Page background   | `src/stylesGlobal/styles.css`    | 189                           |
| App container     | `src/components/App.module.css`  | Uses CSS variable             |
| Main content area | `src/components/Main.module.css` | Uses CSS variable             |

#### `--background-body-transparent` (Light: rgba(255, 255, 255, 0.8) <div style="background-color: rgba(255, 255, 255, 0.8); width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>, Dark: rgba(10, 10, 10, 0.9) <div style="background-color: rgba(10, 10, 10, 0.9); width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component            | Files                                | Dark Mode Implementation Line |
| -------------------- | ------------------------------------ | ----------------------------- |
| Modal overlays       | `src/stylesGlobal/styles.css`        | 190                           |
| Dropdown backgrounds | `src/components/Dropdown.module.css` | Uses CSS variable             |
| Tooltip backgrounds  | `src/components/Tooltip.module.css`  | Uses CSS variable             |

#### `--background-content` (Light: #ffffff <div style="background-color: #ffffff; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>, Dark: #141414 <div style="background-color: #141414; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component                | Files                            | Dark Mode Implementation Line |
| ------------------------ | -------------------------------- | ----------------------------- |
| Content area backgrounds | `src/stylesGlobal/styles.css`    | 191                           |
| Cards and panels         | `src/components/Card.module.css` | Uses CSS variable             |
| Form element backgrounds | `src/components/Form.module.css` | Uses CSS variable             |

#### `--background-highlight` (Light: #f5f6fb <div style="background-color: #f5f6fb; width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>, Dark: #201f1f <div style="background-color: #201f1f; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component               | Files                                | Dark Mode Implementation Line |
| ----------------------- | ------------------------------------ | ----------------------------- |
| Highlighted content     | `src/stylesGlobal/styles.css`        | 192                           |
| Selected items          | `src/components/Selected.module.css` | Uses CSS variable             |
| Hover state backgrounds | `src/components/Hover.module.css`    | Uses CSS variable             |

#### `--border-color` (Light: #d0d2dd <div style="background-color: #d0d2dd; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>, Dark: #303030 <div style="background-color: #303030; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component          | Files                               | Dark Mode Implementation Line |
| ------------------ | ----------------------------------- | ----------------------------- |
| Element borders    | `src/stylesGlobal/styles.css`       | 193                           |
| Container outlines | `src/components/Box.module.css`     | Uses CSS variable             |
| Dividers           | `src/components/Divider.module.css` | Uses CSS variable             |

#### `--box-shadow-color` (Light: rgba(0, 0, 0, 0.05) <div style="background-color: rgba(0, 0, 0, 0.05); width: 20px; height: 20px; border: 1px solid #d0d2dd; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>, Dark: rgba(0, 0, 0, 0.2) <div style="background-color: rgba(0, 0, 0, 0.2); width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin: 0 5px;"></div>)

| Component        | Files                            | Dark Mode Implementation Line |
| ---------------- | -------------------------------- | ----------------------------- |
| Box shadows      | `src/stylesGlobal/styles.css`    | 194                           |
| Element shadows  | `src/components/Card.module.css` | Uses CSS variable             |
| Dropdown shadows | `src/components/Menu.module.css` | Uses CSS variable             |
