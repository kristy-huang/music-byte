export class Track {
  constructor(
    public name: string,
    public id: string,
    public artists: string[],
    public duration_ms: number,
    public external_urls: string,
    public preview_url: string,
    public play_audio: boolean
  ) {}
}
