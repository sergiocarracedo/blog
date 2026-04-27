import AsciinemaPlayer from './components/AsciinemaPlayer.astro';
import CodeFromBlock from './components/CodeFromBlock.astro';
import GalleryModal from './components/GalleryModal.astro';
import SpotifyEmbed from './components/SpotifyEmbed.astro';
import YoutubeEmbed from './components/YoutubeEmbed.astro';

console.log('MDX components loaded');
export const mdxComponents = {
  CodeFromBlock,
  YoutubeEmbed,
  SpotifyEmbed,
  GalleryModal,
  AsciinemaPlayer,
};
