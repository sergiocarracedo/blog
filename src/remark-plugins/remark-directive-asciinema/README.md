# remark-directive-asciinema

Embeds an Asciinema terminal recording. Supports both remotely hosted recordings (asciinema.org) and local `.cast` files.

## Syntax

Remote (asciinema.org hosted):

```
::asciinema{id="RECORDING_ID"}
```

Local `.cast` file:

```
::asciinema{src="./recording.cast"}
```

| Attribute       | Mode   | Required | Description                                   |
| --------------- | ------ | -------- | --------------------------------------------- |
| `id`            | remote | yes\*    | Asciinema.org recording ID                    |
| `src`           | local  | yes\*    | Path to `.cast` file relative to the MDX file |
| `cols`          | local  | no       | Terminal width in columns                     |
| `rows`          | local  | no       | Terminal height in rows                       |
| `autoPlay`      | local  | no       | Start playing automatically                   |
| `loop`          | local  | no       | Loop the recording                            |
| `speed`         | local  | no       | Playback speed multiplier                     |
| `idleTimeLimit` | local  | no       | Cap idle time between frames (seconds)        |
| `theme`         | local  | no       | Player theme name                             |
| `fit`           | local  | no       | Fit mode for the player                       |

\* Either `id` or `src` must be provided.

## Examples

Embed a hosted recording:

```markdown
::asciinema{id="569727"}
```

Embed a local cast file:

```markdown
::asciinema{src="./demo.cast"}
```

Local with player options:

```markdown
::asciinema{src="./demo.cast" cols="120" rows="30" autoPlay="true" loop="true" theme="monokai"}
```
