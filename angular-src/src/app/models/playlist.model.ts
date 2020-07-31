export class Playlist {
  constructor(
    public name: string,
    public id: string,
    public owner: string,
    public description: string,
    public external_urls: string,
    public tracks: object,
    public images: string
  ) {}
}
