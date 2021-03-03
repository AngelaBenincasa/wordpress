<?php
/**
 * @copyright © TMS-Plugins. All rights reserved.
 * @licence   See LICENCE.md for license details.
 */

namespace Elementor;

use AmeliaBooking\Infrastructure\WP\GutenbergBlock\GutenbergBlock;
use AmeliaBooking\Infrastructure\WP\Translations\BackendStrings;

/**
 * Class AmeliaEventsElementorWidget
 *
 * @package AmeliaBooking\Infrastructure\WP\Elementor
 */
class AmeliaEventsElementorWidget extends Widget_Base
{

    public function get_name() {
        return 'ameliaevents';
    }

    public function get_title() {
        return BackendStrings::getWordPressStrings()['events_gutenberg_block']['title'];
    }

    public function get_icon() {
        return 'amelia-logo';
    }

    public function get_categories() {
        return [ 'amelia-elementor' ];
    }
    protected function _register_controls() {

        $this->start_controls_section(
            'amelia_events_section',
            [
                'label' => '<div class="amelia-elementor-content"><p class="amelia-elementor-content-title">'
                    . BackendStrings::getWordPressStrings()['events_gutenberg_block']['title']
                    . '</p><br><p class="amelia-elementor-content-p">'
                    . BackendStrings::getWordPressStrings()['events_gutenberg_block']['description']
                    . '</p>',
            ]
        );

        $this->add_control(
            'preselect',
            [
                'label' => BackendStrings::getWordPressStrings()['filter'],
                'type' => Controls_Manager::SWITCHER,
                'default' => false,
                'label_on' => BackendStrings::getCommonStrings()['yes'],
                'label_off' => BackendStrings::getCommonStrings()['no'],
            ]
        );

        $this->add_control(
            'select_event',
            [
                'label' => BackendStrings::getWordPressStrings()['select_event'],
                'type' => Controls_Manager::SELECT,
                'options' => self::amelia_elementor_get_events(),
                'condition' => ['preselect' => 'yes'],
                'default' => '0',
            ]
        );

        $this->add_control(
            'show_recurring',
            [
                'label' => __('Show recurring events:'),
                'type' => Controls_Manager::SWITCHER,
                'condition' => ['preselect' => 'yes'],
                'default' => false,
                'label_on' => BackendStrings::getCommonStrings()['yes'],
                'label_off' => BackendStrings::getCommonStrings()['no'],
            ]
        );

        $this->add_control(
            'load_manually',
            [
                'label' => BackendStrings::getWordPressStrings()['manually_loading'],
                'label_block' => true,
                'type' => Controls_Manager::TEXT,
                'condition' => ['preselect' => 'yes'],
                'placeholder' => '',
                'description' => BackendStrings::getWordPressStrings()['manually_loading_description'],
            ]
        );

        $this->end_controls_section();
    }

    protected function render() {

        $settings = $this->get_settings_for_display();
        if ($settings['preselect']) {
            $trigger = $settings['load_manually'] !== '' ? ' trigger=' . $settings['load_manually'] : '';
            $selected_event = $settings['select_event'] === '0' ? '' : ' event=' . $settings['select_event'];
            $show_recurring = $settings['show_recurring'] ? ' recurring=1' : '';
            echo '[ameliaevents' . $trigger . $selected_event . $show_recurring . ']';
        } else {
            echo '[ameliaevents]';
        }
    }


    protected function _content_template() {

    }

    public static function amelia_elementor_get_events()
    {
        $events = GutenbergBlock::getEntitiesData()['data']['events'];

        $returnEvents = [];
        $returnEvents['0'] = BackendStrings::getWordPressStrings()['show_all_events'];
        foreach ($events as $event) {
            $returnEvents[$event['id']] = $event['name'] . ' (id: ' . $event['id'] . ')';
        }
        return $returnEvents;
    }
}
