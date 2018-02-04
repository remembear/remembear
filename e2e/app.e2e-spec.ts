import { RememberizePage } from './app.po';

describe('rememberize App', () => {
  let page: RememberizePage;

  beforeEach(() => {
    page = new RememberizePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
