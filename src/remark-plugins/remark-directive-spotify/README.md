# remark-directive-spotify

Embeds a Spotify player via the `SpotifyEmbed` Astro component.

## Syntax

```
::spotify{id="SPOTIFY_ID"}
::spotify{id="SPOTIFY_ID" type="TYPE" width="WIDTH" height="HEIGHT"}
```

| Attribute | Required | Default | Description                                                             |
| --------- | -------- | ------- | ----------------------------------------------------------------------- |
| `id`      | yes      | —       | Spotify item ID                                                         |
| `type`    | no       | `track` | Content type: `track`, `album`, `playlist`, `artist`, `episode`, `show` |
| `width`   | no       | `100%`  | Player width (any valid CSS value)                                      |
| `height`  | no       | `380`   | Player height in pixels                                                 |

## Examples

Embed a track:

```markdown
::spotify{id="4cOdK2wGLETKBW3PvgPWqT"}
```

Embed a playlist:

```markdown
::spotify{id="37i9dQZF1DXcBWIGoYBM5M" type="playlist"}
```

Embed an album with custom height:

```markdown
::spotify{id="1DFixLWuPkv3KT3TnV35m3" type="album" height="250"}
```
