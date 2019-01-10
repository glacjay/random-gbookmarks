$(function() {
  $('.button.opengb').click(() => {
    browser.tabs.create({
      url: 'https://www.google.com/bookmarks',
    });
    window.close();
  });
  $('.button.reload').click(() => {
    browser.runtime.sendMessage({ cmd: 'reload' });
  });
  $('.button.delete').click(() => {
    browser.runtime.sendMessage({ cmd: 'delete' });
  });

  $('.labels').on('click', '.button.label', elem => {
    browser.runtime.sendMessage({
      cmd: 'random',
      label: $(elem.target).text(),
    });
    window.close();
  });

  browser.runtime.getBackgroundPage().then(background => {
    $('.labels > div').remove();
    for (let label of background.labels) {
      let div = $('<div>')
        .attr('class', 'button label')
        .text(label);
      $('.labels').append(div);
    }
  });
});
