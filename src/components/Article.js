/* eslint import/no-webpack-loader-syntax: off */

import React from 'react';
import Editor from 'draft-js-plugins-editor';
import DocumentTitle from 'react-document-title';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import EditArticle from './EditArticle.js';
import ImageGallery from 'react-image-gallery';

import createVideoPlugin from 'draft-js-video-plugin';
import createImagePlugin from 'draft-js-image-plugin';
import createFocusPlugin from 'draft-js-focus-plugin';
import { DefaultDraftBlockRenderMap, EditorState, convertFromRaw } from 'draft-js';
import createLinkifyPlugin from 'draft-js-linkify-plugin';
import '!style-loader!css-loader!draft-js-linkify-plugin/lib/plugin.css';
import createLinkPlugin from 'draft-js-link-plugin';
import '!style-loader!css-loader!draft-js-link-plugin/lib/plugin.css';
import '!style-loader!css-loader!draft-js/dist/Draft.css';

import editorStyles from '../Editor.css';
import videoStyles from '../Video.css';
import imageStyles from '../Image.css';
import ArticleStyles from '../Article.css';

var env = process.env.NODE_ENV || 'development';
var config = require('../config.js')[env];

const linkPlugin = createLinkPlugin({
	component: (props) => {
		const { contentState, ...rest} = props;
		// jsx-a11y/anchor-has-content
		return (<a {...rest} target="_blank"/>);
	}
});
const linkifyPlugin = createLinkifyPlugin({
	component: (props) => {
		const { contentState, ...rest} = props;
		
		return (
			// jsx-a11y/anchor-has-content
			<a {...rest} target="_blank"/>
		);
	}
});
const imagePlugin = createImagePlugin({ theme: imageStyles });
const focusPlugin = createFocusPlugin();
const videoPlugin = createVideoPlugin({theme: videoStyles});


const DraftImgContainer = (props) => {
	return (
		<figure className={editorStyles.videoAndImagesContainer}>
			<div className={editorStyles.videoAndImages}>{props.children}</div>
		</figure>
	)
}

const blockRenderMap = Immutable.Map({
	'atomic': {
		element: DraftImgContainer
	}
});

const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);




const plugins = [focusPlugin, videoPlugin, linkifyPlugin, imagePlugin, linkPlugin];

class Article extends React.Component {
	constructor(props) {
		super(props);
		this.state = { article: EditorState.createEmpty(),
						ogArticle: EditorState.createEmpty(),
						title: props.match.params.article,
						categories: [],
						author: '',
						created: '',
						updated: '',
						images: [],
						inEdit: false,
						finished: false
					};
		this.onChange = (article) => this.setState({article});
		this.onCancel = this.onCancel.bind(this);
		this.onPublish = this.onPublish.bind(this);
	}
	
	componentDidMount() {
		this.fetchArticle();
	}
	
	componentWillReceiveProps(nextProps) {
		if (this.props.match.params.article !== nextProps.match.params.article) {
			this.setState({ title: nextProps.match.params.article },
				() => this.fetchArticle());
		}
	}
	
	
	fetchArticle() {
		fetch(config.url + "/getArticle",
		{
			method: 'post',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ key: this.state.title }),
			credentials: 'include'
		})
			.then((response) => response.json())
			.then((rs) => {
				var cookedContent = convertFromRaw(JSON.parse(rs.body));
				var selArticle = EditorState.createWithContent(cookedContent);
				
				var articleInfo = rs.info[0];
				var newCat = [];
				for (var key in articleInfo) {
					if (articleInfo[key] === 1) {
						newCat.push(key);
					}
				}
				
				var created = new Date(articleInfo.Created);
				created = created.getMonth()+1 + "/" + created.getDate() + "/" + created.getFullYear();
				
				var updated = new Date(articleInfo.Last_Updated);
				updated = updated.getMonth()+1 + "/" + updated.getDate() + "/" + updated.getFullYear();
				
				this.setState({ article: selArticle, ogArticle: selArticle, categories: newCat, finished: true,
								author: articleInfo.Author, created: created, updated: updated, inEdit: false });
			})
			.catch((error) => {
				console.log(error);
			});
			
		fetch(config.url + "/getImgBarMedia",
		{
			method: 'post',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ article: this.state.title }),
			credentials: 'include'
		})
			.then((response) => response.json())
			.then((rs) => {
				this.setState({ images: rs.images });
			})
			.catch((error) => {
				console.log(error);
			});				
	}
	
	
	startEdit() {
		this.setState({ inEdit: true });
	}
	
	cancelEdit() {
		this.setState({ inEdit: false });
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
	
	onScreenChange(stuff) {
		if(stuff) {
			var index = this._imageGallery.getCurrentIndex();
			console.log(index);
			var win = window.open(this.state.images[index].original, '_blank');
			if (win) {
				win.focus();
			} else {
				alert('Please allow popups for this website');
			}
		}
	}
	
	onCancel() {
		this.cancelEdit();
	}
	
	onPublish() {
		this.fetchArticle();
	}
	
	_focus() {
		this.editor.focus();
	}
	
	
	render() {
		const { login } = this.props;
		const { inEdit, article, title, author, categories, created, finished, images } = this.state;
		const editMode = (login && inEdit);
		
		
		return (
			<DocumentTitle title={title + ' - Awesome Totally Awesome'}>
			<div>
				{editMode ? (
						<EditArticle
							article={article}
							title={title}
							author={author}
							categories={categories}
							created={created}
							images={images}
							onCancel={this.onCancel}
							onPublish={this.onPublish}
							
						/>
				) : (
					<div>
						{login ? (
							<button onClick={this.startEdit.bind(this)}>Edit/Delete Article</button>
						) : (
							<div></div>
						)}
						<div className={ArticleStyles.Article}>
						
							<div className={ArticleStyles.Title}>
								{this.state.title}
							</div>
							
							<div className={ArticleStyles.SubInfo}>
								<div className={ArticleStyles.Author}>
									<Link className={ArticleStyles.Link} to={`/realHome/auth/${this.state.author}/page=1`}>
										{this.state.author}
									</Link>
								</div>
								<div className={ArticleStyles.Categories}>
									<ul className={ArticleStyles.CatList}>
										{this.state.categories.map(cat => {
											let linkCat = this.toLink(cat);
											let formatCat = this.withoutUnderscore(cat)
											return (
												<li className={ArticleStyles.Category} key={cat}>
													<Link className={ArticleStyles.Link} to={`/realHome/cat/${linkCat}/page=1`} >
														{formatCat}
													</Link>
												</li>
											)
										})}
									</ul>
								</div>
								<div className={ArticleStyles.Created}>
									{this.state.created}
								</div>
								<div className={ArticleStyles.Updated}>
									{this.state.updated}
								</div>
							</div>
							
							<div className={ArticleStyles.ImageBarContainer}>
								{images.length > 0 ? (
									<div className={ArticleStyles.ImageBar}>
										<ImageGallery
											items={images}
											showPlayButton={false}
											showBullets={images.length > 1 ? true : false}
											showThumbnails={false}
											showFullscreenButton={images.length > 0 ? true : false}
											ref={i => this._imageGallery = i}
											onScreenChange={this.onScreenChange.bind(this)}
										/>
									</div>
								) : (
									<div></div>
								)}
							</div>
						
							<div className={ArticleStyles.Body} onClick={this._focus.bind(this)}>
								{finished ? (
								
									<Editor 
										editorState={article}
										plugins={plugins} 
										onChange={this.onChange}
										blockRenderMap={extendedBlockRenderMap}
										ref={(element) => { this.editor = element; }}
										readOnly
									/>
								) : ( <div></div>
								)}
								
							</div>
						</div>
					</div>
				)}
			</div>
			</DocumentTitle>
		)
	}
}


const mapStateToProps = state => {
	return {
		login: state.login
	}
}

export default connect(mapStateToProps)(Article)