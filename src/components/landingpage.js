import React, { Component } from 'react';
import { Grid, Cell } from 'react-mdl';

class Landing extends Component {
    render() {
        return(
            <div className="landing-content">
                <Grid className="landing-grid">
                    <Cell col={12}>
                        <img 
                            src="https://avatars3.githubusercontent.com/u/8031672?s=400&v=4"
                            alt="avatar"
                            className="avatar-img"
                        />
                        <div className="banner-text">
                            <h1>Austin Ramberg</h1>
                            <h2>Analytics | Machine Learning | WebDev</h2>
                            <hr/>
                            <p>Python | C# | SQL | React | Angular | Tensorflow</p>
                            <div className="social-links">
                                <a href="https://github.com/aramberg4" rel="noopener noreferrer" target="_blank">
                                    <i class="fa fa-github" aria-hidden="true"></i>
                                </a>
                                <a href="https://www.linkedin.com/in/austinramberg/" rel="noopener noreferrer" target="_blank">
                                    <i class="fa fa-linkedin-square" aria-hidden="true"></i>
                                </a>
                                <a href="https://leetcode.com/aero11/" rel="noopener noreferrer" target="_blank">
                                    <i class="iconify" data-icon="simple-icons:leetcode" data-inline="false"></i>
                                </a>
                                
                            </div>
                        </div>
                    </Cell>
                </Grid>
            </div>
        )
    }
}

export default Landing;