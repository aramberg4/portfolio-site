import React, { Component } from 'react';
import { Tabs, Tab, Card, CardTitle, CardActions, Button, CardMenu, IconButton, CardText } from 'react-mdl';
import pitch from '../resources/pitch2.png'
import mongodd from '../resources/mongoD&D.png'
import lamps from '../resources/lamps.PNG'

class Projects extends Component {
    constructor(props) {
        super(props);
        this.state = { activeTab: 0 };
    }
    render() {
        return(
            <div className="content">
                <div className="flex-box">

                <Card shadow={0} style={{width: '600px', margin: 'auto', borderRadius: '10px', margin: '20px'}}>
                        <CardTitle style={{color: '#3494E6', height: '230px', background: `url( ${lamps}) center / cover`}}></CardTitle>
                        <CardText>
                            <h3>Lamps.com</h3>
                            I am currently a software engineer at Lamps.com - an online retailer for everything lighting and more.
                        </CardText>
                        <CardActions border>
                        <Button colored><a href="https://lamps.com" style={{textDecoration: 'none'}} rel="noopener noreferrer" target="_blank">Visit Site</a></Button>
                        </CardActions>
                        <CardMenu style={{color: '#fff'}}>
                            <IconButton name="share" />
                        </CardMenu>
                    </Card>

                    <Card shadow={0} style={{width: '600px', margin: 'auto', borderRadius: '10px', margin: '20px'}}>
                        <CardTitle style={{color: 'white', height: '230px', background: `url( ${pitch} ) center / cover`}}></CardTitle>
                        <CardText>
                            <h3>Pitch</h3>
                            Angular App that helps local musicians and venues connect.
                        </CardText>
                        <CardActions border>
                            <Button colored><a href="https://github.com/jmccar385/Pitch" style={{textDecoration: 'none'}} rel="noopener noreferrer" target="_blank">GitHub</a></Button>
                        </CardActions>
                        <CardMenu style={{color: '#fff'}}>
                            <IconButton name="share" />
                        </CardMenu>
                    </Card>

                    <Card shadow={0} style={{width: '600px', margin: 'auto', borderRadius: '10px', margin: '20px'}}>
                        <CardTitle style={{color: '#3494E6', height: '230px', background: 'url(https://anthonybonato.files.wordpress.com/2017/06/illustration3.png?w=980&h=400&crop=1) center / cover'}}></CardTitle>
                        <CardText>
                            <h3>PageRank</h3>
                            My own basic implementation of the Page Rank Algorithm derived by Lawrence Page and Sergey Brin using Python 2.
                        </CardText>
                        <CardActions border>
                        <Button colored><a href="https://github.com/aramberg4/PageRank" style={{textDecoration: 'none'}} rel="noopener noreferrer" target="_blank">GitHub</a></Button>
                        </CardActions>
                        <CardMenu style={{color: '#fff'}}>
                            <IconButton name="share" />
                        </CardMenu>
                    </Card>

                    <Card shadow={0} style={{width: '600px', margin: 'auto', borderRadius: '10px', margin: '20px'}}>
                        <CardTitle style={{color: '#3494E6', height: '230px', background: `url( ${mongodd} ) center / cover`}}></CardTitle>
                        <CardText>
                            <h3>MongoD&D</h3>
                            D&D 5e spell management tool built using Python and MongoDB.
                        </CardText>
                        <CardActions border>
                            <Button colored><a href="https://github.com/aramberg4/INFO_366_Project" style={{textDecoration: 'none'}} rel="noopener noreferrer" target="_blank">GitHub</a></Button>
                        </CardActions>
                        <CardMenu style={{color: '#fff'}}>
                            <IconButton name="share" />
                        </CardMenu>
                    </Card>
                </div>
            </div>
        )
    }
}

export default Projects;