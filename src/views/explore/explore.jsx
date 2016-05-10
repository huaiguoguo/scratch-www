var injectIntl = require('react-intl').injectIntl;
var FormattedMessage = require('react-intl').FormattedMessage;
var React = require('react');
var render = require('../../lib/render.jsx');

var Api = require('../../mixins/api.jsx');

var Page = require('../../components/page/www/page.jsx');
var Box = require('../../components/box/box.jsx');
var Tabs = require('../../components/tabs/tabs.jsx');
var Select = require('../../components/forms/select.jsx');
var SubNavigation = require('../../components/subnavigation/subnavigation.jsx');
var Grid = require('../../components/grid/grid.jsx');

require('./explore.scss');

// @todo migrate to React-Router once available
var Explore = injectIntl(React.createClass({
    type: 'Explore',
    mixins: [
        Api
    ],
    getDefaultProps: function () {
        var tabOptions = ['all','animations','art','games','music','stories'];

        var pathname = window.location.pathname;
        if (pathname.substring(pathname.length-1,pathname.length) == '/') {
            pathname = pathname.substring(0,pathname.length-1);
        }
        var slash = pathname.lastIndexOf('/');
        var currentTab = pathname.substring(slash+1,pathname.length).toLowerCase();
        if (tabOptions.indexOf(currentTab) == -1) {
            window.location = window.location.origin + '/explore/projects/all/';
        }

        return {
            tab: currentTab,
            acceptableTabs: tabOptions,
            loadNumber: 16
        };
    },
    getInitialState: function () {
        return {
            loaded: [],
            offset: 0
        };
    },
    componentDidMount: function () {
        this.getExploreMore();
    },
    getExploreMore: function () {
        var tabText = '';
        if (this.props.tab != 'all') {
            tabText = '&q=' + this.props.tab;
        }
        this.api({
            uri: '/search/projects?limit=' + this.props.loadNumber + '&offset=' + this.state.offset + tabText
        }, function (err, body) {
            if (!err) {
                var loadedSoFar = this.state.loaded;
                Array.prototype.push.apply(loadedSoFar,body);
                this.setState({loaded: loadedSoFar});
                var currentOffset = this.state.offset + this.props.loadNumber;
                this.setState({offset: currentOffset});
            }
        }.bind(this));
    },
    getTab: function (type) {
        var allTab = <a href={'/explore/projects/'+type+'/'}>
                        <li>
                            <FormattedMessage
                                id={'explore.' + type}
                                defaultMessage={type.charAt(0).toUpperCase() + type.slice(1)} />
                        </li>
                    </a>;
        if (this.props.tab==type) {
            allTab = <a href={'/explore/projects/' + type + '/'}>
                        <li className='active'>
                            <FormattedMessage
                                id={'explore.' + type}
                                defaultMessage={type.charAt(0).toUpperCase() + type.slice(1)} />
                        </li>
                    </a>;
        }
        return allTab;
    },
    render: function () {
        return (
            <div>
                <div className='outer'>
                    <Box title={'Explore'}
                        moreProps={{
                            className: 'tabs'
                        }}>
                        <Tabs>
                            {this.getTab('all')}
                            {this.getTab('animations')}
                            {this.getTab('art')}
                            {this.getTab('games')}
                            {this.getTab('music')}
                            {this.getTab('stories')}
                            <Select name="sort" defaultValue="Projects">
                                <option value="Projects" key="Projects">
                                    Projects
                                </option>
                                <option value="Studios" key="Studios">
                                    Studios
                                </option>
                            </Select>
                        </Tabs>
                        <div id='projectBox' key='projectBox'>
                            <Grid items={this.state.loaded} itemType='projects'
                                showLoves={true} showFavorites={true} showViews={true} />
                            <SubNavigation className='load'>
                                <button onClick={this.getExploreMore}>
                                    <li>
                                        <FormattedMessage
                                            id='load'
                                            defaultMessage={'Load More'} />
                                    </li>
                                </button>
                            </SubNavigation>
                        </div>
                    </Box>
                </div>
            </div>

        );
    }
}));

render(<Page><Explore /></Page>, document.getElementById('app'));
