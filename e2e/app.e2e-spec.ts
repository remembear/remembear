import { RemembearPage } from './app.po';

describe('remembear App', () => {
  let page: RemembearPage;

  beforeEach(() => {
    page = new RemembearPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
