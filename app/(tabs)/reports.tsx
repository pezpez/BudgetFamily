import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Surface, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import { fetchReportData, type Period, type ReportData } from '../../utils/reportData';
import { palette } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';
import { useAppTheme } from '../../hooks/useAppTheme';

const PERIOD_LABELS: { value: Period; label: string }[] = [
  { value: 'month', label: 'Mois' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Année' },
];

export default function ReportsScreen() {
  const [period, setPeriod] = useState<Period>('month');
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { colors } = useAppTheme();

  async function load(p: Period) {
    setLoading(true);
    const result = await fetchReportData(p, new Date());
    setData(result);
    setLoading(false);
  }

  useFocusEffect(useCallback(() => { load(period); }, [period]));

  function handlePeriodChange(p: string) {
    setPeriod(p as Period);
  }

  const pieData = data?.categorySlices.map((s) => ({
    value: s.total,
    color: s.color,
    text: `${Math.round(s.percentage)}%`,
  })) ?? [];

  const barData: { value: number; label: string; frontColor: string; topLabelComponent?: () => JSX.Element }[] = [];
  if (data) {
    data.monthBars.forEach((m) => {
      barData.push({ value: m.income, label: m.label, frontColor: palette.accent });
      barData.push({ value: m.expense, label: '', frontColor: palette.danger });
    });
  }

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Period selector */}
      <SegmentedButtons
        value={period}
        onValueChange={handlePeriodChange}
        buttons={PERIOD_LABELS}
        style={styles.periodSelector}
      />

      {loading || !data ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : (
        <>
          {/* Summary cards */}
          <View style={styles.summaryRow}>
            <Surface style={[styles.summaryCard, { flex: 1 }]} elevation={1}>
              <MaterialCommunityIcons name="arrow-down-circle" size={20} color={palette.accent} />
              <Text variant="labelSmall" style={styles.summaryLabel}>Entrées</Text>
              <Text style={[styles.summaryAmount, { color: palette.accent }]}>
                {formatCurrency(data.totalIncome)}
              </Text>
            </Surface>
            <Surface style={[styles.summaryCard, { flex: 1 }]} elevation={1}>
              <MaterialCommunityIcons name="arrow-up-circle" size={20} color={palette.danger} />
              <Text variant="labelSmall" style={styles.summaryLabel}>Dépenses</Text>
              <Text style={[styles.summaryAmount, { color: palette.danger }]}>
                {formatCurrency(data.totalExpense)}
              </Text>
            </Surface>
            <Surface style={[styles.summaryCard, { flex: 1 }]} elevation={1}>
              <MaterialCommunityIcons
                name="scale-balance"
                size={20}
                color={data.balance >= 0 ? palette.success : palette.danger}
              />
              <Text variant="labelSmall" style={styles.summaryLabel}>Solde</Text>
              <Text style={[styles.summaryAmount, { color: data.balance >= 0 ? palette.success : palette.danger }]}>
                {data.balance >= 0 ? '+' : ''}{formatCurrency(data.balance)}
              </Text>
            </Surface>
          </View>

          {/* Donut chart */}
          <Surface style={styles.card} elevation={1}>
            <Text variant="titleSmall" style={styles.cardTitle}>Répartition des dépenses</Text>
            {pieData.length === 0 ? (
              <View style={styles.emptyChart}>
                <MaterialCommunityIcons name="chart-donut" size={48} color="#D1D5DB" />
                <Text variant="bodySmall" style={styles.emptyText}>Aucune dépense sur cette période</Text>
              </View>
            ) : (
              <>
                <View style={styles.chartWrap}>
                  <PieChart
                    data={pieData}
                    donut
                    radius={110}
                    innerRadius={72}
                    centerLabelComponent={() => (
                      <View style={styles.donutCenter}>
                        <Text style={styles.donutCenterAmount}>{formatCurrency(data.totalExpense)}</Text>
                        <Text style={styles.donutCenterLabel}>total</Text>
                      </View>
                    )}
                    showText
                    textColor="#fff"
                    textSize={11}
                    fontWeight="700"
                  />
                </View>
                {/* Legend */}
                <View style={styles.legend}>
                  {data.categorySlices.map((s) => (
                    <View key={s.name} style={styles.legendRow}>
                      <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                      <View style={[styles.legendIcon, { backgroundColor: s.color + '22' }]}>
                        <MaterialCommunityIcons name={s.icon as any} size={14} color={s.color} />
                      </View>
                      <Text variant="bodySmall" style={styles.legendName}>{s.name}</Text>
                      <Text variant="bodySmall" style={[styles.legendAmount, { color: s.color }]}>
                        {formatCurrency(s.total)}
                      </Text>
                      <Text variant="labelSmall" style={styles.legendPct}>
                        {Math.round(s.percentage)}%
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </Surface>

          {/* Bar chart */}
          <Surface style={styles.card} elevation={1}>
            <Text variant="titleSmall" style={styles.cardTitle}>Entrées vs Dépenses (6 mois)</Text>
            <View style={styles.barLegend}>
              <View style={styles.barLegendItem}>
                <View style={[styles.barLegendDot, { backgroundColor: palette.accent }]} />
                <Text variant="labelSmall" style={styles.barLegendLabel}>Entrées</Text>
              </View>
              <View style={styles.barLegendItem}>
                <View style={[styles.barLegendDot, { backgroundColor: palette.danger }]} />
                <Text variant="labelSmall" style={styles.barLegendLabel}>Dépenses</Text>
              </View>
            </View>
            {barData.every((b) => b.value === 0) ? (
              <View style={styles.emptyChart}>
                <MaterialCommunityIcons name="chart-bar" size={48} color="#D1D5DB" />
                <Text variant="bodySmall" style={styles.emptyText}>Aucune donnée à afficher</Text>
              </View>
            ) : (
              <View style={styles.chartWrap}>
                <BarChart
                  data={barData}
                  barWidth={14}
                  spacing={6}
                  roundedTop
                  hideRules
                  hideYAxisText
                  xAxisThickness={1}
                  xAxisColor="#E5E7EB"
                  yAxisThickness={0}
                  noOfSections={4}
                  maxValue={Math.max(...barData.map((b) => b.value)) * 1.2 || 100}
                  width={280}
                  height={160}
                  labelWidth={40}
                  xAxisLabelTextStyle={{ color: palette.textSecondary, fontSize: 11 }}
                />
              </View>
            )}
          </Surface>

          {/* Category table */}
          <Surface style={styles.card} elevation={1}>
            <Text variant="titleSmall" style={styles.cardTitle}>Détail par catégorie</Text>
            {data.categorySlices.length === 0 ? (
              <Text variant="bodySmall" style={[styles.emptyText, { textAlign: 'center', paddingVertical: 8 }]}>
                Aucune dépense sur cette période
              </Text>
            ) : (
              data.categorySlices.map((s, i) => (
                <View key={s.name}>
                  {i > 0 && <View style={styles.rowDivider} />}
                  <View style={styles.tableRow}>
                    <View style={[styles.tableDot, { backgroundColor: s.color }]} />
                    <View style={[styles.tableIcon, { backgroundColor: s.color + '22' }]}>
                      <MaterialCommunityIcons name={s.icon as any} size={16} color={s.color} />
                    </View>
                    <Text variant="bodyMedium" style={styles.tableName}>{s.name}</Text>
                    <View style={styles.tableRight}>
                      <Text style={[styles.tableAmount, { color: palette.danger }]}>
                        {formatCurrency(s.total)}
                      </Text>
                      <View style={styles.tableBarWrap}>
                        <View style={[styles.tableBar, { width: `${s.percentage}%` as any, backgroundColor: s.color }]} />
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </Surface>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.backgroundLight },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  periodSelector: { marginBottom: 4 },
  loadingWrap: { height: 300, alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCard: { borderRadius: 16, padding: 12, alignItems: 'center', gap: 4 },
  summaryLabel: { color: palette.textSecondary },
  summaryAmount: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  card: { borderRadius: 16, padding: 16 },
  cardTitle: { color: palette.textPrimary, fontWeight: '700', marginBottom: 16 },
  chartWrap: { alignItems: 'center', marginBottom: 8 },
  donutCenter: { alignItems: 'center' },
  donutCenterAmount: { fontSize: 15, fontWeight: '800', color: palette.textPrimary },
  donutCenterLabel: { fontSize: 11, color: palette.textSecondary },
  emptyChart: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { color: palette.textSecondary },
  legend: { gap: 10, marginTop: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  legendName: { flex: 1, color: palette.textPrimary },
  legendAmount: { fontWeight: '600' },
  legendPct: { color: palette.textSecondary, width: 32, textAlign: 'right' },
  barLegend: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  barLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLegendDot: { width: 10, height: 10, borderRadius: 2 },
  barLegendLabel: { color: palette.textSecondary },
  rowDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },
  tableRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tableDot: { width: 6, height: 6, borderRadius: 3 },
  tableIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tableName: { flex: 1, color: palette.textPrimary },
  tableRight: { alignItems: 'flex-end', gap: 4, minWidth: 100 },
  tableAmount: { fontWeight: '600', fontSize: 14 },
  tableBarWrap: { width: 80, height: 4, backgroundColor: '#F3F4F6', borderRadius: 2 },
  tableBar: { height: 4, borderRadius: 2 },
});
