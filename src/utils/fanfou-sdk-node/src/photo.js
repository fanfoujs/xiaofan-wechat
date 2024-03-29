class Photo {
  constructor(photo) {
    this.url = photo.url
    this.imageurl = photo.imageurl
    this.thumburl = photo.thumburl
    this.largeurl = photo.largeurl
    // eslint-disable-next-line unicorn/prefer-string-replace-all
    this.originurl = photo.largeurl.replace(/@.+\..+$/g, '')
    this.type = this.originurl.match(/^.+\.(.+)$/)[1].toLowerCase()
  }
}

module.exports = Photo
