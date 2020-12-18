import React, {Component} from 'react';
import fse from 'fs-extra';

class Import extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lang: '',
      abbr: '',
    };
  }

  changeLang(this, e) {
    this.setState({lang: e.target.value});
  }

  changeAbbr(this, e) {
    this.setState({abbr: e.target.value});
  }

  readFile(this, e) {
    const filePath = e.target.files[0].path;
    const content = fse.readFileSync(filePath).toString("utf8");
    let contentType = filePath.split('.').pop();
    this.props.pk.importDocument(
      {
        lang: this.state.lang,
        abbr: this.state.abbr,
      },
      contentType,
      content,
      {}
    );
  }

  render() {
    return (
      <div className="content">
        <p>This is where we do the importing</p>
        <form>
          <div>
            {'LANG '}
            <input
              type="text"
              name="lang"
              value={this.state.lang}
              onChange={(e) => this.changeLang(e)}
            />
          </div>
          <div>
            {'ABBR '}
            <input
              type="text"
              name="lang"
              value={this.state.abbr}
              onChange={(e) => this.changeAbbr(e)}
            />
          </div>
          <div>
            <input
              type="file"
              name="lang"
              onChange={e => this.readFile(e)}
            />
          </div>
        </form>
      </div>
    );
  };

}

export default Import;
