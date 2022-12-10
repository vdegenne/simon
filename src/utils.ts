export async function sleep (timeoutMs = 1000) {
  return await new Promise(r => setTimeout(r, timeoutMs))
}



const sounds: { path: string, audio: HTMLAudioElement }[] = []

export function playAudio (path: string) {
  let Sound = sounds.find(s => s.path === path)
  if (!Sound) {
    Sound = {
      path,
      audio: new Audio(path)
    }
    sounds.push(Sound)
  }
  Sound.audio.play()
}