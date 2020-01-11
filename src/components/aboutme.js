import React, { Component } from 'react';
import { Grid, Cell, List, ListItem, ListItemContent } from 'react-mdl';
import pfp from '../resources/headShot.PNG'

class About extends Component {
    render() {
        return(
            <div className="about-body">
                <Grid className="about-grid">
                    <Cell col={6} className="about-left-col">
                        <div style={{ textAlign: 'center'}}>
                        <img
                            src={pfp}
                            alt="avatar"
                            className="about-avatar-img"
                        />
                        </div>
                        <h2>Austin Ramberg</h2>
                        <h4 style={{ color: 'grey' }}>Software Developer</h4>
                        <hr style={{borderTop: '3px solid #833fb2', width: '50%'}} />
                        <h4>Contact Me</h4>
                        <div className="about-list">
                            <List>                 
                                <ListItem>
                                    <ListItemContent style={{fontSize: '16px' }}>
                                        <i className="fa fa-envelope" aria-hidden="true" />
                                        aramberg4@gmail.com
                                    </ListItemContent>
                                </ListItem>
                                <ListItem>
                                    <ListItemContent style={{fontSize: '16px' }}>
                                        <i className="fa fa-linkedin-square" aria-hidden="true" />
                                        /in/austinramberg
                                    </ListItemContent>
                                </ListItem>
                                <ListItem>
                                    <ListItemContent style={{fontSize: '16px'}}>
                                        <i class="fa fa-facebook-official" aria-hidden="true"></i>
                                        Austin Ramberg
                                    </ListItemContent>
                                </ListItem>
                            </List>
                        </div>

                    </Cell>
                    <Cell className="about-right-col" col={6}>
                        <h2>About Me</h2>
                        <p>I’m a graduate from Drexel University with a Bachelor’s Degree in Informatics and a keen interest in data. I have had two co-ops while studying at Drexel. The first as a proprietary trade support developer at Susquehanna International Group, a High Frequency Trade Firm in Bala Cynwyd, PA. The other as a production application support developer at Brandywine Global, an asset management firm right in Philadelphia. I like playing squash, building computers, reading, watching football and (of course) coding. </p>
                        <hr style={{borderTop: '3px solid #833fb2', width: '50%'}} />
                        <p>The purpose of this website is mainly to consolidate all of my personal projects, professional experience and contact info all in one place for the convenience of anyone who is interested. Unfortunately, most work I have done at an enterprise level is proprietary and not available on GitHub. Please refer to my resume for contributions to enterprise projects.</p>
                        <hr style={{borderTop: '3px solid #833fb2', width: '50%'}} />
                        <p>If you have any questions, please don't hesitate to contact me. Email is preferred. Please enjoy your time here!</p>
                        <div>

                        </div>
                    </Cell>
                </Grid>
            </div>
        )
    }
}

export default About;