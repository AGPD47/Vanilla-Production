export default {
  name: 'galleryItem',
  title: 'Gallery Item',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          'Home',
          'Photography',
          'Video Production',
          'Advertising',
          'Architecture',
          'Events',
          'F&B',
          'Fashion',
          'Industrial',
          'Travel and landscape',
        ],
      },
    },
    {
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          {title: 'Image', value: 'image'},
          {title: 'Video (Embed URL)', value: 'video'},
        ],
        layout: 'radio',
      },
    },
    {
      name: 'image',
      title: 'Image Upload',
      type: 'image',
      options: {hotspot: true},
      hidden: ({parent}) => parent?.mediaType !== 'image',
    },
    {
      name: 'embedUrl',
      title: 'Video Embed URL (YouTube/Vimeo)',
      type: 'url',
      hidden: ({parent}) => parent?.mediaType !== 'video',
    },
  ],
}
