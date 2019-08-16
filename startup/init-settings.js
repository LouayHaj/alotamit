const Setting = require('../models/setting');

module.exports = function (req, res, next) {
  Setting.findOne({}).then(settings => {
    if (settings === null) {
      Setting.create([
        {
          nameAr: 'alo tamir ar',
          nameTr: 'alo tamir tr',
          addressAr: 'İncili Pınar Mh. gazimuhtar pasa bulvari doktorlar sitesi no:38. b blok. kat 6 .no 601',
          addressTr: 'İncili Pınar Mh. gazimuhtar pasa bulvari doktorlar sitesi no:38. b blok. kat 6 .no 601',
          aboutFooterAr: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry s standard dummy text ever since the 1500s, when an unknown printer took a galley of type  and scrambled it to make a type specimen book.It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industrys standard dummy text",
          aboutFooterTr: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry s standard dummy text ever since the 1500s, when an unknown printer took a galley of type  and scrambled it to make a type specimen book.It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industrys standard dummy text",
          policyAr: 'policy ar',
          policyTr: 'policy tr',
          tearmsAr: 'terms ar',
          tearmsTr: 'terms tr',
          aboutUsAr: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry s standard dummy text ever since the 1500s, when an unknown printer took a galley of type  and scrambled it to make a type specimen book.It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but',
          aboutUsTr: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type  and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but",
          aboutUs: ' ',
          tearms: ' ',
          aboutFooter: ' ',
          policy: ' ',
          address: ' ',
          name: ' ',
          email: 'info@alotamir.com',
          faceook: 'https://fb.com',
          twitter: 'twitter.com',
          whatsapp: '0090876544334',
          phone: '+905398515143',
          youtube: 'yb.com'
        },
      ])
        .then(setting => {
          console.log('[++] Settings has been initialized [++]');
        })
    }
  });
};
