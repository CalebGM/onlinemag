import React, { Component } from 'react';
import styles from '../mediaStyles.css';


class MediaAdd extends Component {
	constructor(props) {
		super(props);
		this.state = ({ url: '', open: false, });
	}
	
	componentDidMount() {
		document.addEventListener('click', this.closePopover.bind(this));
	}
	
	componentWillUnmount() {
		document.removeEventListener('click', this.closePopover.bind(this));
	}
	
	
	onPopoverClick() {
		this.preventNextClose = true;
	}
	
	openPopover() {
		if(!this.state.open) {
			this.preventNextClose = true;
			this.setState({open: true});
		}
	}
	
	closePopover() {
		if(!this.preventNextClose && this.state.open) {
			this.setState({open: false});
		}
		
		this.preventNextClose = false;
	}
	
	addMedia () {
		console.log(this);
		const {editorState, onChange} = this.props;
		if(this.props.type === 'video') {
			onChange(this.props.modifier(editorState, {src: this.state.url}));
		} else if(this.props.type === 'image') {
			onChange(this.props.modifier(editorState, this.state.url));
		}
	}
	
	changeUrl(event) {
		this.setState({ url: event.target.value });
	}
	
	render() {
		//const addMediaImage = (this.props.type === 'video' ? videoImage : imageImage);
		const chooseMedia = this.state.open ? styles.popoverOpen : styles.popoverClosed;
		const addUrl = this.state.open ? styles.urlOpen : styles.urlClosed;
		return (
			<div className=''>
				<button className={chooseMedia} onMouseUp={this.openPopover.bind(this)} type="button">+</button>
				<div className={addUrl} onClick={this.onPopoverClick.bind(this)}>
					<input type="text" placeholder="Paste the url...." className='' onChange={this.changeUrl.bind(this)} value={this.state.url} />
					<button className='addMedia' type="button" onClick={this.addMedia.bind(this)} >Add Media</button>
				</div>
			</div>
		);
	}
}

export default MediaAdd;