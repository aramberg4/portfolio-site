import React, { Component } from 'react';
import { Tabs, Tab, Card, CardTitle, CardActions, Button, CardMenu, IconButton, CardText } from 'react-mdl';

class Projects extends Component {
    constructor(props) {
        super(props);
        this.state = { activeTab: 0 };
    }
    render() {
        return(
            <div className="content">
                <Card shadow={0} style={{width: '512px', margin: 'auto'}}>
                    <CardTitle style={{color: '#fff', height: '176px', background: 'url(http://www.getmdl.io/assets/demos/welcome_card.jpg) center / cover'}}>Pitch</CardTitle>
                    <CardText>
                    Angular App that centralizes communication between venues and musicians
                    </CardText>
                    <CardActions border>
                        <Button colored>GitHub</Button>
                    </CardActions>
                    <CardMenu style={{color: '#fff'}}>
                        <IconButton name="share" />
                    </CardMenu>
                </Card>

                <Card shadow={0} style={{width: '512px', margin: 'auto'}}>
                    <CardTitle style={{color: '#fff', height: '176px', background: 'url(http://www.getmdl.io/assets/demos/welcome_card.jpg) center / cover'}}>MongoD&D</CardTitle>
                    <CardText>
                    Angular App that centralizes communication between venues and musicians
                    </CardText>
                    <CardActions border>
                        <Button colored>GitHub</Button>
                    </CardActions>
                    <CardMenu style={{color: '#fff'}}>
                        <IconButton name="share" />
                    </CardMenu>
                </Card>

                <Card shadow={0} style={{width: '512px', margin: 'auto'}}>
                    <CardTitle style={{color: '#fff', height: '176px', background: 'url(http://www.getmdl.io/assets/demos/welcome_card.jpg) center / cover'}}>PageRank</CardTitle>
                    <CardText>
                    Angular App that centralizes communication between venues and musicians
                    </CardText>
                    <CardActions border>
                        <Button colored>GitHub</Button>
                    </CardActions>
                    <CardMenu style={{color: '#fff'}}>
                        <IconButton name="share" />
                    </CardMenu>
                </Card>
            </div>
        )
    }
}

export default Projects;