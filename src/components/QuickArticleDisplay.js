import React from 'react';
import { Link } from 'react-router-dom';
import quickDisplay from '../QuickArticle.css';


var env = process.env.NODE_ENV || 'development';
var config = require('../config.js')[env];


class QuickArticleDisplay extends React.Component {
	constructor(props) {
		super(props);
		this.state = { categories: [] };
	}
	
	componentDidMount() {
		var articleInfo = this.props.article;
		var title = articleInfo.Title;
		var logo = config.baseUrl + title + '/logo';
		var newCat = this.state.categories;
		for (var key in articleInfo) {
			if (articleInfo[key] === 1) {
				newCat.push(key);
			}
		}
		
		var created = new Date(articleInfo.Created);
		created = created.getMonth()+1 + "/" + created.getDate() + "/" + created.getFullYear();
		this.setState({ logoUrl: logo, categories: newCat, created: created });
		
	}
	
	toLink(cat) {
		var formatCat = cat;

		var slashSplit = cat.split("/");
		if (slashSplit[1]) {
			formatCat = slashSplit[0] + "_" + slashSplit[1];
		}
		
		
		var split = formatCat.split("_");
		formatCat = split[0].charAt(0).toLowerCase() + split[0].slice(1);
		if (split[1]) {
			formatCat = formatCat + "_" + (split[1].charAt(0).toLowerCase() + split[1].slice(1));
		}
		
		return formatCat;
	}
	
	withoutUnderscore(cat) {
		var split = cat.split("_");
		var formatCat = split[0].charAt(0) + split[0].slice(1);
		
		
		if (split[0] === 'Art') {
			return 'Art/Photography';
		} else if (split[0] === 'Fashion') {
			return 'Fashion/Kicks';
		}
		if (split[1]) {
			return formatCat + " " + (split[1].charAt(0) + split[1].slice(1));
		}
		
		return formatCat;
	}
	
	
	render() {
		return (
			<div className={quickDisplay.Article}>
				<div className={quickDisplay.ImgContainer}>
					<Link to={`/realHome/story/${this.props.article.Title}`}>
						<img src={this.state.logoUrl} alt='Article Too Awesome For Logo'/>
					</Link>
				</div>
				<div className={quickDisplay.InfoContainer}>
					<div className={quickDisplay.Categories}>
						<ul className={quickDisplay.CatList}>
							{this.state.categories.map(cat => {
								let linkCat = this.toLink(cat);
								let formatCat = this.withoutUnderscore(cat);
								return (
									<li className={quickDisplay.Category} key={cat}>
										<Link className={quickDisplay.CatLink} to={`/realHome/cat/${linkCat}/page=1`} >
											{formatCat}
										</Link>
									</li>
								)
							})}
						</ul>
					</div>
					<div className={quickDisplay.Title}>
						<Link className={quickDisplay.TitleLink} to={`/realHome/story/${this.props.article.Title}`}>
							{this.props.article.Title}
						</Link>
					</div>
					<div className={quickDisplay.SubInfo}>
						<div className={quickDisplay.Author}> 
							<Link className={quickDisplay.AuthorLink} to={`/realHome/auth/${this.props.article.Author}/page=1`}>
								{this.props.article.Author}
							</Link>
						</div>

						<div className={quickDisplay.Created}>
							{this.state.created}
						</div>
					</div>
				</div>
			</div>
		)
	}
	
	
}

export default QuickArticleDisplay;